import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api-client";

type Category = {
  id: number;
  name: string;
  slug: string;
  postsCount?: number;
};

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await publicApi.getCategories();
        if (!mounted) return;
        if (res.success && res.data) {
          setCategories(
            res.data.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              postsCount: c.postsCount ?? 0,
            }))
          );
        } else {
          setError(res.message || "카테고리를 불러올 수 없습니다.");
        }
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "카테고리를 불러오는 중 오류");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <nav className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        카테고리
      </h2>
      {error ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          카테고리가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to={`/categories/${category.slug}`}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {category.postsCount ?? 0}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

