import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
          개발 블로그
        </Link>
        <div className="flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            홈
          </Link>
          <Link
            href="/posts"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            포스트
          </Link>
        </div>
      </nav>
    </header>
  );
}


