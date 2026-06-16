import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminApiClient } from "@/lib/api-client";

interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTagsPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    if (!storedToken) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  const fetchTags = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const adminApi = new AdminApiClient(token);
      const response = await adminApi.getTags();
      if (response.success && response.data) setTags(response.data);
      else setError(response.message || "태그를 불러오는 데 실패했습니다.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "태그를 불러오는 중 오류");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTags();
  }, [token, fetchTags]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      const adminApi = new AdminApiClient(token);
      const response = await adminApi.createTag(formData);
      if ((response as any).success) {
        setShowCreateModal(false);
        setFormData({ name: "" });
        fetchTags();
      } else {
        setError((response as any).message || "태그 생성에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "태그 생성 중 오류");
    }
  };

  const handleEditClick = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingTag) return;
    setError(null);
    try {
      const adminApi = new AdminApiClient(token);
      const response = await adminApi.updateTag(editingTag.id, formData);
      if ((response as any).success) {
        setShowEditModal(false);
        setEditingTag(null);
        setFormData({ name: "" });
        fetchTags();
      } else {
        setError((response as any).message || "태그 수정에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "태그 수정 중 오류");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!token) return;
    if (!window.confirm(`정말로 "${name}" 태그를 삭제하시겠습니까?`)) return;
    setError(null);
    try {
      const adminApi = new AdminApiClient(token);
      const response = await adminApi.deleteTag(id);
      if ((response as any).success) fetchTags();
      else setError((response as any).message || "태그 삭제에 실패했습니다.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "태그 삭제 중 오류");
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingTag(null);
    setFormData({ name: "" });
    setError(null);
  };

  if (!token || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
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
              <Link to="/admin/posts" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                포스트
              </Link>
              <Link to="/admin/categories" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                카테고리
              </Link>
              <Link to="/admin/tags" className="text-sm font-medium text-blue-600 dark:text-blue-400">
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">태그 관리</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              블로그 포스트에 사용할 태그를 추가, 수정, 삭제할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            태그 추가
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {tags.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              아직 태그가 없습니다. 새로운 태그를 추가해보세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">#{tag.name}</h3>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">슬러그: {tag.slug}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>생성: {new Date(tag.createdAt).toLocaleDateString("ko-KR")}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(tag)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">새 태그 생성</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    태그 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    취소
                  </button>
                  <button type="submit" className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">태그 수정</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  ✕
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    태그 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    취소
                  </button>
                  <button type="submit" className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    수정
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

