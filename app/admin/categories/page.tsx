"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  // API 클라이언트 초기화
  const getApiClient = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return null;
    }
    return new AdminApiClient(token);
  };

  // 카테고리 목록 조회
  const fetchCategories = async () => {
    const apiClient = getApiClient();
    if (!apiClient) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.message || "카테고리를 불러올 수 없습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "카테고리를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카테고리 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiClient = getApiClient();
    if (!apiClient) return;

    if (!formData.name.trim()) {
      setError("카테고리 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiClient.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      if (response.success) {
        setShowCreateModal(false);
        setFormData({ name: "", description: "" });
        await fetchCategories();
      } else {
        setError(response.message || "카테고리 생성에 실패했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "카테고리 생성 중 오류가 발생했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 카테고리 수정
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const apiClient = getApiClient();
    if (!apiClient) return;

    if (!formData.name.trim()) {
      setError("카테고리 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiClient.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      if (response.success) {
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        await fetchCategories();
      } else {
        setError(response.message || "카테고리 수정에 실패했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "카테고리 수정 중 오류가 발생했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 카테고리 삭제
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 카테고리를 정말 삭제하시겠습니까?`)) {
      return;
    }

    const apiClient = getApiClient();
    if (!apiClient) return;

    setError("");

    try {
      const response = await apiClient.deleteCategory(id);

      if (response.success) {
        await fetchCategories();
      } else {
        setError(response.message || "카테고리 삭제에 실패했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "카테고리 삭제 중 오류가 발생했습니다."
      );
    }
  };

  // 수정 모달 열기
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setError("");
  };

  // 모달 닫기
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
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                포스트
              </Link>
              <Link
                href="/admin/categories"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
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
              카테고리 관리
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              블로그 카테고리를 관리할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            + 카테고리 추가
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

        {/* 카테고리 목록 */}
        {categories.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              등록된 카테고리가 없습니다.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              첫 번째 카테고리 추가하기
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {category.slug}
                  </p>
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    생성:{" "}
                    {new Date(category.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="flex-1 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 생성/수정 모달 */}
        {(showCreateModal || editingCategory) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCategory ? "카테고리 수정" : "카테고리 생성"}
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

              <form onSubmit={editingCategory ? handleUpdate : handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      카테고리 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="예: 웹 개발"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      설명
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="카테고리에 대한 설명을 입력하세요"
                    />
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
                    {submitting
                      ? "처리 중..."
                      : editingCategory
                      ? "수정"
                      : "생성"}
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
