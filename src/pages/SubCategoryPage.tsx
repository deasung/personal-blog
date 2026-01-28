import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import PostCard, { PostCardData } from "@/components/PostCard";
import { publicApi } from "@/lib/api-client";

export default function SubCategoryPage() {
  const { category, subcategory } = useParams();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const categoryPath = useMemo(() => {
    if (!category || !subcategory) return "";
    return `${category}/${subcategory}`;
  }, [category, subcategory]);

  useEffect(() => {
    if (!category || !subcategory) return;
    let mounted = true;
    (async () => {
      try {
        const res = await publicApi.getPosts({ category, limit: 200, page: 1 });
        if (!mounted) return;
        if (res.success && res.data) {
          const filtered = res.data.filter(
            (p) =>
              p.categorySlug === `${category}/${subcategory}` ||
              p.categorySlug === subcategory
          );
          setPosts(
            filtered.map((p) => ({
              id: p.id,
              title: p.title,
              excerpt: p.excerpt,
              publishedAt: p.publishedAt,
              categorySlug: p.categorySlug,
              tags: p.tags.map((t) => t.name),
            }))
          );
          setApiError(null);
        } else {
          setApiError(res.message || "포스트를 불러올 수 없습니다.");
        }
      } catch (e) {
        if (!mounted) return;
        setApiError(e instanceof Error ? e.message : "API 서버에 연결할 수 없습니다.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [category, subcategory]);

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <div className="mb-4">
          <Link
            to={`/categories/${category}`}
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← {category}로 돌아가기
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            {categoryPath}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {categoryPath} 카테고리의 포스트 목록입니다.
          </p>
        </div>

        {apiError ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-200">⚠️ {apiError}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              이 카테고리에 아직 포스트가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

