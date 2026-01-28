"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminApiClient } from "@/lib/api-client";

interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTagsPage() {
  const router = useRouter();
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
      router.push("/admin/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchTags = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const adminApi = new AdminApiClient(token);
      const response = await adminApi.getTags();
      if (response.success && response.data) {
        setTags(response.data);
      } else {
        setError(response.message || "태그를 불러오는 데 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "태그를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTags();
    }
  }, [token, fetchTags]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      const adminApi = new AdminApiClient(token);
      const response = await adminApi.createTag(formData);
      if (response.success) {
        setShowCreateModal(false);
        setFormData({ name: "" });
        fetchTags();
      } else {
        setError(response.message || "태그 생성에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "태그 생성 중 오류가 발생했습니다."
      );
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
      if (response.success) {
        setShowEditModal(false);
        setEditingTag(null);
        setFormData({ name: "" });
        fetchTags();
      } else {
        setError(response.message || "태그 수정에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "태그 수정 중 오류가 발생했습니다."
      );
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!token) return;
    if (window.confirm(`정말로 "${name}" 태그를 삭제하시겠습니까?`)) {
      setError(null);
      try {
        const adminApi = new AdminApiClient(token);
        const response = await adminApi.deleteTag(id);
        if (response.success) {
          fetchTags();
        } else {
          setError(response.message || "태그 삭제에 실패했습니다.");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "태그 삭제 중 오류가 발생했습니다."
        );
      }
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
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                카테고리
              </Link>
              <Link
                href="/admin/tags"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              태그 관리
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              블로그 포스트에 사용할 태그를 추가, 수정, 삭제할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            태그 추가
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
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

        {/* 태그 목록 */}
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
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    #{tag.name}
                  </h3>
                </div>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  슬러그: {tag.slug}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    생성: {new Date(tag.createdAt).toLocaleDateString("ko-KR")}
                  </span>
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

        {/* 생성 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  새 태그 생성
                </h3>
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
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="create-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    태그 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="create-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="예: JavaScript"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    슬러그는 자동으로 생성됩니다.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && editingTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  태그 수정
                </h3>
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
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    태그 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="예: JavaScript"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    슬러그는 자동으로 업데이트됩니다.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
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
