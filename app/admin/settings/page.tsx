"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminApiClient } from "@/lib/api-client";

type SettingValueType = "string" | "json" | "null";

interface SettingRow {
  key: string;
  id: number;
  value: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EditableSettingRow {
  key: string;
  id: number;
  valueType: SettingValueType;
  inputValue: string;
  createdAt: string;
  updatedAt: string;
  initialValueType: SettingValueType;
  initialInputValue: string;
}

function isValidSettingKey(key: string) {
  if (typeof key !== "string") return false;
  if (key.length < 1 || key.length > 100) return false;
  return /^[a-z0-9_]+$/.test(key);
}

function buildEditableRows(data: Record<string, Omit<SettingRow, "key">>) {
  const rows: EditableSettingRow[] = Object.entries(data)
    .map(([key, row]) => {
      const initialValueType: SettingValueType = row.value === null ? "null" : "string";
      const initialInputValue = row.value === null ? "" : row.value;
      return {
        key,
        id: row.id,
        valueType: initialValueType,
        inputValue: initialInputValue,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        initialValueType,
        initialInputValue,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
  return rows;
}

function hasChanged(row: EditableSettingRow) {
  return row.valueType !== row.initialValueType || row.inputValue !== row.initialInputValue;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<EditableSettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 새 설정 추가 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createKey, setCreateKey] = useState("");
  const [createValueType, setCreateValueType] = useState<SettingValueType>("string");
  const [createInputValue, setCreateInputValue] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    if (!storedToken) {
      router.push("/admin/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const api = new AdminApiClient(token);
      const res = await api.getSettings();
      if (res.success && res.data) {
        setRows(buildEditableRows(res.data));
      } else {
        setError(res.message || "설정을 불러오는 데 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "설정을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchSettings();
  }, [token, fetchSettings]);

  const dirtyCount = useMemo(() => rows.filter(hasChanged).length, [rows]);

  const updateRow = (key: string, patch: Partial<EditableSettingRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  };

  const buildUpdatePayload = () => {
    const payload: Record<string, unknown> = {};
    const jsonErrors: Array<{ key: string; message: string }> = [];

    for (const row of rows) {
      if (!hasChanged(row)) continue;

      if (!isValidSettingKey(row.key)) {
        jsonErrors.push({
          key: row.key,
          message: "키 형식이 올바르지 않습니다. (영문 소문자/숫자/언더스코어, 1~100자)",
        });
        continue;
      }

      if (row.valueType === "null") {
        payload[row.key] = null;
        continue;
      }

      if (row.valueType === "string") {
        payload[row.key] = row.inputValue;
        continue;
      }

      // json
      try {
        payload[row.key] = JSON.parse(row.inputValue);
      } catch {
        jsonErrors.push({
          key: row.key,
          message: "JSON 파싱에 실패했습니다. 예: true, 1, \"text\", {\"a\":1}, [1,2]",
        });
      }
    }

    return { payload, jsonErrors };
  };

  const handleSaveAll = async () => {
    if (!token) return;
    setError(null);
    setSuccessMessage(null);

    const { payload, jsonErrors } = buildUpdatePayload();
    if (jsonErrors.length > 0) {
      setError(
        jsonErrors
          .slice(0, 3)
          .map((e) => `${e.key}: ${e.message}`)
          .join("\n") + (jsonErrors.length > 3 ? "\n..." : "")
      );
      return;
    }

    if (Object.keys(payload).length === 0) {
      setError("변경된 설정이 없습니다.");
      return;
    }

    setSaving(true);
    try {
      const api = new AdminApiClient(token);
      const res = await api.updateSettings(payload);
      if (res.success && res.data) {
        setRows(buildEditableRows(res.data));
        setSuccessMessage("설정이 저장되었습니다.");
      } else {
        setError(res.message || "설정 저장에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateKey("");
    setCreateValueType("string");
    setCreateInputValue("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccessMessage(null);

    const key = createKey.trim();
    if (!isValidSettingKey(key)) {
      setError("키 형식이 올바르지 않습니다. (영문 소문자/숫자/언더스코어, 1~100자)");
      return;
    }

    let value: unknown;
    if (createValueType === "null") {
      value = null;
    } else if (createValueType === "string") {
      value = createInputValue;
    } else {
      try {
        value = JSON.parse(createInputValue);
      } catch {
        setError("새 설정 값의 JSON 파싱에 실패했습니다.");
        return;
      }
    }

    setSaving(true);
    try {
      const api = new AdminApiClient(token);
      const res = await api.updateSettings({ [key]: value });
      if (res.success && res.data) {
        setRows(buildEditableRows(res.data));
        closeCreateModal();
        setSuccessMessage("새 설정이 저장되었습니다.");
      } else {
        setError(res.message || "새 설정 저장에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "새 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
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
            <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
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
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                태그
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">설정 관리</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              사이트 설정을 조회/수정할 수 있습니다. 값 타입은 문자열/JSON/null을 지원합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={fetchSettings}
              disabled={saving}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
            >
              새로고침
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              + 새 설정
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving || dirtyCount === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "저장 중..." : `변경사항 저장 (${dirtyCount})`}
            </button>
          </div>
        </div>

        {/* 메시지 */}
        {error && (
          <div className="mb-4 whitespace-pre-line rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
            {successMessage}
          </div>
        )}

        {/* 목록 */}
        {rows.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">등록된 설정이 없습니다.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              첫 번째 설정 추가하기
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-12 gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
              <div className="col-span-3">키</div>
              <div className="col-span-2">타입</div>
              <div className="col-span-5">값</div>
              <div className="col-span-2 text-right">상태</div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row) => {
                const dirty = hasChanged(row);
                return (
                  <div key={row.key} className="grid grid-cols-12 gap-2 px-4 py-3">
                    <div className="col-span-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {row.key}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        id: {row.id}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <select
                        value={row.valueType}
                        onChange={(e) => {
                          const valueType = e.target.value as SettingValueType;
                          updateRow(row.key, {
                            valueType,
                            inputValue: valueType === "null" ? "" : row.inputValue,
                          });
                        }}
                        className="block w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="string">string</option>
                        <option value="json">json</option>
                        <option value="null">null</option>
                      </select>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        업데이트: {new Date(row.updatedAt).toLocaleString("ko-KR")}
                      </div>
                    </div>

                    <div className="col-span-5">
                      <textarea
                        value={row.inputValue}
                        onChange={(e) => updateRow(row.key, { inputValue: e.target.value })}
                        disabled={row.valueType === "null"}
                        rows={2}
                        className="block w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
                        placeholder={
                          row.valueType === "json"
                            ? "예: true, 1, \"text\", {\"a\":1}, [1,2]"
                            : "값을 입력하세요"
                        }
                      />
                    </div>

                    <div className="col-span-2 flex items-start justify-end">
                      {dirty ? (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                          변경됨
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          동일
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 새 설정 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">새 설정 추가</h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  키 <span className="text-red-500">*</span>
                </label>
                <input
                  value={createKey}
                  onChange={(e) => setCreateKey(e.target.value)}
                  placeholder="예: site_title"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  영문 소문자/숫자/언더스코어만 허용 (1~100자)
                </p>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    타입
                  </label>
                  <select
                    value={createValueType}
                    onChange={(e) => setCreateValueType(e.target.value as SettingValueType)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="string">string</option>
                    <option value="json">json</option>
                    <option value="null">null</option>
                  </select>
                </div>
                <div className="col-span-8">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    값
                  </label>
                  <textarea
                    value={createInputValue}
                    onChange={(e) => setCreateInputValue(e.target.value)}
                    disabled={createValueType === "null"}
                    rows={3}
                    placeholder={
                      createValueType === "json"
                        ? "예: true, 1, \"text\", {\"a\":1}, [1,2]"
                        : "값을 입력하세요"
                    }
                    className="block w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

