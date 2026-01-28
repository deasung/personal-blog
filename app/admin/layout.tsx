"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // 로그인 페이지는 인증 체크 건너뛰기
  const isLoginPage = pathname === "/admin/login";

  // 로그인 페이지는 초기 상태를 true로 설정
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    isLoginPage ? true : null
  );

  useEffect(() => {
    // 로그인 페이지는 인증 체크 불필요
    if (isLoginPage) {
      return;
    }

    // 로그인 페이지가 아닐 때만 인증 체크
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin/login");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router, pathname, isLoginPage]);

  // 로그인 페이지는 레이아웃 체크 없이 바로 렌더링
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
