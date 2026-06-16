import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminApiClient } from "@/lib/api-client";
import TiptapEditor from "@/components/TiptapEditor";

interface Post {
  id: number;
  title: string;
  thumbnail?: string | null;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  tags: Array<{ id: number; name: string; slug: string }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function AdminPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterPublished, setFilterPublished] = useState<boolean | undefined>(undefined);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    thumbnail: "",
    categoryId: 0,
    published: false,
    tagIds: [] as number[],
    content: "",
  });

  const getApiClient = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login", { replace: true });
      return null;
    }
    return new AdminApiClient(token);
  };

  const fetchPosts = async () => {
    const api = getApiClient();
    if (!api) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.getPosts({ published: filterPublished, limit: 50 });
      if (res.success && res.data) setPosts(res.data);
      else setError(res.message || "포스트를 불러올 수 없습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "포스트를 불러오는 중 오류");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const api = getApiClient();
    if (!api) return;
    try {
      const res = await api.getCategories();
      if (res.success && res.data) setCategories(res.data);
    } catch {
      // ignore
    }
  };

  const fetchTags = async () => {
    const api = getApiClient();
    if (!api) return;
    try {
      const res = await api.getTags();
      if (res.success && res.data) setTags(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPublished]);

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const openCreate = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      thumbnail: "",
      categoryId: 0,
      published: false,
      tagIds: [],
      content: "",
    });
    setError("");
    setShowModal(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      thumbnail: post.thumbnail || "",
      categoryId: post.categoryId,
      published: post.published,
      tagIds: post.tags.map((t) => t.id),
      content: post.content,
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const api = getApiClient();
    if (!api) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    if (!formData.categoryId) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (editingPost) {
        const res = await api.updatePost(editingPost.id, {
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || undefined,
          thumbnail: formData.thumbnail.trim() ? formData.thumbnail.trim() : null,
          categoryId: formData.categoryId,
          published: formData.published,
          tagIds: formData.tagIds.length ? formData.tagIds : undefined,
        });
        if ((res as any).success) {
          closeModal();
          await fetchPosts();
        } else setError((res as any).message || "포스트 수정에 실패했습니다.");
      } else {
        const res = await api.createPost({
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || undefined,
          thumbnail: formData.thumbnail.trim() || undefined,
          categoryId: formData.categoryId,
          published: formData.published,
          tagIds: formData.tagIds.length ? formData.tagIds : undefined,
        });
        if ((res as any).success) {
          closeModal();
          await fetchPosts();
        } else setError((res as any).message || "포스트 생성에 실패했습니다.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 포스트를 정말 삭제하시겠습니까?`)) return;
    const api = getApiClient();
    if (!api) return;
    setError("");
    try {
      const res = await api.deletePost(id);
      if ((res as any).success) await fetchPosts();
      else setError((res as any).message || "포스트 삭제에 실패했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "포스트 삭제 중 오류");
    }
  };

  const paginationHint = useMemo(() => {
    if (filterPublished === undefined) return "전체";
    return filterPublished ? "발행됨" : "임시저장";
  }, [filterPublished]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
              어드민 대시보드
            </Link>
            <div className="flex gap-4">
              <Link to="/admin/posts" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                포스트
              </Link>
              <Link to="/admin/categories" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                카테고리
              </Link>
              <Link to="/admin/tags" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                태그
              </Link>
              <Link to="/admin/settings" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                설정
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              블로그 홈
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_user");
                navigate("/admin/login", { replace: true });
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">포스트 관리</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              블로그 포스트를 작성, 수정, 삭제할 수 있습니다. (현재 에디터는 간단 textarea 버전)
            </p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + 포스트 작성
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterPublished(undefined)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filterPublished === undefined ? "bg-blue-600 text-white" : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterPublished(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filterPublished === true ? "bg-blue-600 text-white" : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            발행됨
          </button>
          <button
            onClick={() => setFilterPublished(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filterPublished === false ? "bg-blue-600 text-white" : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            임시저장
          </button>
          <span className="ml-2 self-center text-sm text-gray-500 dark:text-gray-400">
            현재: {paginationHint}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">등록된 포스트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                      {post.published ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          발행됨
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          임시저장
                        </span>
                      )}
                    </div>
                    {post.excerpt && <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{post.excerpt}</p>}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="rounded bg-blue-100 px-2 py-1 dark:bg-blue-900/30">{post.categoryName}</span>
                      {post.tags.map((tag) => (
                        <span key={tag.id} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Link
                      to={`/posts/${post.id}`}
                      target="_blank"
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      보기
                    </Link>
                    <button
                      onClick={() => openEdit(post)}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPost ? "포스트 수정" : "포스트 작성"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">요약</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                    rows={2}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">썸네일 URL</label>
                  <input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData((p) => ({ ...p, thumbnail: e.target.value }))}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    (React 마이그레이션 버전에서는 업로드 UI를 제외하고 URL 입력만 지원)
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData((p) => ({ ...p, categoryId: Number(e.target.value) }))}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value={0}>카테고리를 선택하세요</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">태그</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                          formData.tagIds.includes(tag.id)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    내용 <span className="text-red-500">*</span>
                  </label>
                  <TiptapEditor
                    content={formData.content}
                    onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
                    placeholder="포스트 내용을 입력하세요..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="published"
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData((p) => ({ ...p, published: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    즉시 발행
                  </label>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "처리 중..." : editingPost ? "수정" : "작성"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

