import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminApiClient } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const getApiClient = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login", { replace: true });
      return null;
    }
    return new AdminApiClient(token);
  };

  const fetchCategories = async () => {
    const apiClient = getApiClient();
    if (!apiClient) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) setCategories(response.data);
      else setError(response.message || "카테고리를 불러올 수 없습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "카테고리를 불러오는 중 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiClient = getApiClient();
    if (!apiClient) return;

    if (!formData.name.trim()) return setError("카테고리 이름을 입력해주세요.");

    setSubmitting(true);
    setError("");
    try {
      const response = await apiClient.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      if ((response as any).success) {
        setShowCreateModal(false);
        setFormData({ name: "", description: "" });
        await fetchCategories();
      } else {
        setError((response as any).message || "카테고리 생성에 실패했습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "카테고리 생성 중 오류");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const apiClient = getApiClient();
    if (!apiClient) return;

    if (!formData.name.trim()) return setError("카테고리 이름을 입력해주세요.");

    setSubmitting(true);
    setError("");
    try {
      const response = await apiClient.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      if ((response as any).success) {
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        await fetchCategories();
      } else {
        setError((response as any).message || "카테고리 수정에 실패했습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "카테고리 수정 중 오류");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 카테고리를 정말 삭제하시겠습니까?`)) return;
    const apiClient = getApiClient();
    if (!apiClient) return;
    setError("");
    try {
      const response = await apiClient.deleteCategory(id);
      if ((response as any).success) await fetchCategories();
      else setError((response as any).message || "카테고리 삭제에 실패했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "카테고리 삭제 중 오류");
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setError("");
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setError("");
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
              <Link to="/admin/categories" className="text-sm font-medium text-blue-600 dark:text-blue-400">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">카테고리 관리</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">블로그 카테고리를 관리할 수 있습니다.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + 카테고리 추가
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {categories.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">등록된 카테고리가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{category.slug}</p>
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{category.description}</p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="flex-1 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(showCreateModal || editingCategory) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCategory ? "카테고리 수정" : "카테고리 생성"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  ✕
                </button>
              </div>

              <form onSubmit={editingCategory ? handleUpdate : handleCreate} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    카테고리 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
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
                    {submitting ? "처리 중..." : editingCategory ? "수정" : "생성"}
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

