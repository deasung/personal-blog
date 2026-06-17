import { Link } from "react-router-dom";

export default function Header({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
      <nav className="mx-auto max-w-2xl px-6 py-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {title || "Dev Blog"}
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/posts"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            글
          </Link>
          <a
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            관리
          </a>
        </div>
      </nav>
    </header>
  );
}

