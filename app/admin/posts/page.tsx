"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AdminApiClient } from "@/lib/api-client";
import TiptapEditor from "@/app/components/TiptapEditor";

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
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
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
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    thumbnail: "",
    categoryId: 0,
    published: false,
    tagIds: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [filterPublished, setFilterPublished] = useState<boolean | undefined>(
    undefined
  );

  // API 클라이언트 초기화
  const getApiClient = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return null;
    }
    return new AdminApiClient(token);
  };

  // 포스트 목록 조회
  const fetchPosts = async () => {
    const apiClient = getApiClient();
    if (!apiClient) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.getPosts({
        published: filterPublished,
        limit: 50,
      });
      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        setError(response.message || "포스트를 불러올 수 없습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "포스트를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 조회
  const fetchCategories = async () => {
    const apiClient = getApiClient();
    if (!apiClient) return;

    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // 태그 목록 조회
  const fetchTags = async () => {
    const apiClient = getApiClient();
    if (!apiClient) return;

    try {
      const response = await apiClient.getTags();
      if (response.success && response.data) {
        setTags(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPublished]);

  // 포스트 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiClient = getApiClient();
    if (!apiClient) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    if (formData.categoryId === 0) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiClient.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        thumbnail: formData.thumbnail.trim() || undefined,
        categoryId: formData.categoryId,
        published: formData.published,
        tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
      });

      if (response.success) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          content: "",
          excerpt: "",
          thumbnail: "",
          categoryId: 0,
          published: false,
          tagIds: [],
        });
        await fetchPosts();
      } else {
        setError(response.message || "포스트 생성에 실패했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "포스트 생성 중 오류가 발생했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 포스트 수정
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const apiClient = getApiClient();
    if (!apiClient) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    if (formData.categoryId === 0) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiClient.updatePost(editingPost.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        // 빈 문자열이면 null로 보내서 "썸네일 제거"가 가능하게 처리
        thumbnail: formData.thumbnail.trim() ? formData.thumbnail.trim() : null,
        categoryId: formData.categoryId,
        published: formData.published,
        tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
      });

      if (response.success) {
        setEditingPost(null);
        setFormData({
          title: "",
          content: "",
          excerpt: "",
          thumbnail: "",
          categoryId: 0,
          published: false,
          tagIds: [],
        });
        await fetchPosts();
      } else {
        setError(response.message || "포스트 수정에 실패했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "포스트 수정 중 오류가 발생했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 포스트 삭제
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 포스트를 정말 삭제하시겠습니까?`)) {
      return;
    }

    const apiClient = getApiClient();
    if (!apiClient) return;

    setError("");

    try {
      const response = await apiClient.deletePost(id);

      if (response.success) {
        await fetchPosts();
      } else {
        setError(response.message || "포스트 삭제에 실패했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "포스트 삭제 중 오류가 발생했습니다."
      );
    }
  };

  // 수정 모달 열기
  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      thumbnail: post.thumbnail || "",
      categoryId: post.categoryId,
      published: post.published,
      tagIds: post.tags.map((tag) => tag.id),
    });
    setError("");
  };

  // 모달 닫기
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingPost(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      thumbnail: "",
      categoryId: 0,
      published: false,
      tagIds: [],
    });
    setError("");
  };

  const uploadThumbnail = async (file: File) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setThumbnailUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const result = await res.json();
      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "썸네일 업로드에 실패했습니다.");
      }

      const url: string | undefined = result?.data?.url;
      if (!url) throw new Error("업로드 URL을 받지 못했습니다.");

      setFormData((prev) => ({ ...prev, thumbnail: url }));
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "썸네일 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setThumbnailUploading(false);
    }
  };

  const pickThumbnailFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) uploadThumbnail(file);
    };
    input.click();
  };

  // 태그 토글
  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 네비게이션 바 */}
      <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              어드민 대시보드
            </Link>
            <div className="flex gap-4">
              <Link
                href="/admin/posts"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                포스트
              </Link>
              <Link
                href="/admin/categories"
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                카테고리
              </Link>
              <Link
                href="/admin/tags"
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                태그
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                설정
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              블로그 홈
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_user");
                router.push("/admin/login");
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              포스트 관리
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              블로그 포스트를 작성, 수정, 삭제할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            + 포스트 작성
          </button>
        </div>

        {/* 필터 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterPublished(undefined)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterPublished === undefined
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterPublished(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterPublished === true
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            발행됨
          </button>
          <button
            onClick={() => setFilterPublished(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterPublished === false
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            임시저장
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 포스트 목록 */}
        {posts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              등록된 포스트가 없습니다.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              첫 번째 포스트 작성하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
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
                    {post.excerpt && (
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="rounded bg-blue-100 px-2 py-1 dark:bg-blue-900/30">
                        {post.categoryName}
                      </span>
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700"
                        >
                          #{tag.name}
                        </span>
                      ))}
                      <span>
                        생성:{" "}
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                      {post.publishedAt && (
                        <span>
                          발행:{" "}
                          {new Date(post.publishedAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      보기
                    </Link>
                    <button
                      onClick={() => openEditModal(post)}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 생성/수정 모달 */}
        {(showCreateModal || editingPost) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPost ? "포스트 수정" : "포스트 작성"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingPost ? handleUpdate : handleCreate}>
                <div className="space-y-4">
                  {/* 제목 */}
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      제목: <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="포스트 제목을 입력하세요"
                    />
                  </div>

                  {/* 요약 */}
                  <div>
                    <label
                      htmlFor="excerpt"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      요약
                    </label>
                    <textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          excerpt: e.target.value,
                        }))
                      }
                      rows={2}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="포스트 요약을 입력하세요"
                    />
                  </div>

                  {/* 대표 썸네일 */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      대표 썸네일:
                    </label>
                    <div className="flex flex-col gap-3">
                      {formData.thumbnail ? (
                        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                          <Image
                            src={formData.thumbnail}
                            alt="대표 썸네일 미리보기"
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                          썸네일이 없습니다.
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={pickThumbnailFile}
                          disabled={thumbnailUploading}
                          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          {thumbnailUploading
                            ? "업로드 중..."
                            : "썸네일 업로드"}
                        </button>
                        {formData.thumbnail && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  formData.thumbnail
                                )
                              }
                              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              URL 복사
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  thumbnail: "",
                                }))
                              }
                              className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            >
                              제거
                            </button>
                          </>
                        )}
                      </div>

                      {formData.thumbnail && (
                        <input
                          type="text"
                          value={formData.thumbnail}
                          readOnly
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        />
                      )}
                    </div>
                  </div>

                  {/* 카테고리 */}
                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: parseInt(e.target.value),
                        }))
                      }
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={0}>카테고리를 선택하세요</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 태그 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      태그
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            formData.tagIds.includes(tag.id)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                    {tags.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        등록된 태그가 없습니다.
                      </p>
                    )}
                  </div>

                  {/* 내용 */}
                  <div>
                    <label
                      htmlFor="content"
                      className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      내용: <span className="text-red-500">*</span>
                    </label>
                    <TiptapEditor
                      content={formData.content}
                      onChange={(content) =>
                        setFormData((prev) => ({ ...prev, content }))
                      }
                      placeholder="포스트 내용을 입력하세요..."
                    />
                  </div>

                  {/* 발행 여부 */}
                  <div className="flex items-center gap-2">
                    <input
                      id="published"
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          published: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="published"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      즉시 발행
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
