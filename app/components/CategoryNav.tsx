import Link from "next/link";
import { categories } from "@/lib/categories";
import { getCategoryPostCounts } from "@/lib/posts";

export default function CategoryNav() {
  const counts = getCategoryPostCounts();

  return (
    <nav className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        카테고리
      </h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.id}`}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <div className="flex items-center justify-between">
                <span>{category.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {counts[category.id] || 0}
                </span>
              </div>
            </Link>
            {category.subcategories && category.subcategories.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1">
                {category.subcategories.map((subcategory) => {
                  const key = `${category.id}/${subcategory.id}`;
                  return (
                    <li key={subcategory.id}>
                      <Link
                        href={`/categories/${category.id}/${subcategory.id}`}
                        className="block rounded-lg px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <span>{subcategory.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {counts[key] || 0}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
