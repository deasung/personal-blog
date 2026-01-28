import Link from "next/link";
import { publicApi } from "@/lib/api-client";

export default async function CategoryNav() {
  let apiCategories: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    postsCount?: number;
  }> = [];

  try {
    const categoriesResponse = await publicApi.getCategories();
    if (categoriesResponse.success && categoriesResponse.data) {
      apiCategories = categoriesResponse.data.map((cat) => ({
        ...cat,
        postsCount: cat.postsCount || 0,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <nav className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        카테고리
      </h2>
      {apiCategories.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          카테고리가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {apiCategories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">
                    {category.name}
                  </span>
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
