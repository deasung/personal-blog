"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api-client";

interface AdminUser {
  id: number;
  email: string;
  username: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");

    if (!token || !userStr) {
      router.push("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setAdminUser(user);
    } catch (error) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  if (!adminUser) {
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            어드민 대시보드
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {adminUser.email}
            </span>
            <Link
              href="/"
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              블로그 홈
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            관리자 대시보드
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            블로그 관리 기능을 사용할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/posts"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              포스트 관리
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              블로그 포스트를 작성, 수정, 삭제할 수 있습니다.
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              카테고리 관리
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              카테고리를 추가, 수정, 삭제할 수 있습니다.
            </p>
          </Link>

          <Link
            href="/admin/tags"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              태그 관리
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              태그를 추가, 수정, 삭제할 수 있습니다.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              설정
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              사이트 설정을 관리할 수 있습니다.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
