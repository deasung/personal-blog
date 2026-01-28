import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import PostCard, { PostCardData } from "@/components/PostCard";
import { publicApi } from "@/lib/api-client";

export default function PostsPage() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1") || 1;
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await publicApi.getPosts({ page, limit: 12, category, tag });
        if (!mounted) return;
        if (res.success && res.data) {
          setPosts(
            res.data.map((p) => ({
              id: p.id,
              title: p.title,
              excerpt: p.excerpt,
              publishedAt: p.publishedAt,
              categorySlug: p.categorySlug,
              tags: p.tags.map((t) => t.name),
            }))
          );
          setPagination(res.pagination ?? null);
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
  }, [page, category, tag]);

  const paginationLinks = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return [];
    return Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
  }, [pagination]);

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            모든 포스트
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            개발과 취미에 관한 글들을 모았습니다.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <CategoryNav />
          </aside>

          <div className="lg:col-span-3">
            {apiError ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
                <p className="text-yellow-800 dark:text-yellow-200">⚠️ {apiError}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">
                  아직 작성된 포스트가 없습니다.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {paginationLinks.length > 0 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {paginationLinks.map((pageNum) => {
                      const qs = new URLSearchParams();
                      qs.set("page", String(pageNum));
                      if (category) qs.set("category", category);
                      if (tag) qs.set("tag", tag);
                      return (
                        <Link
                          key={pageNum}
                          to={`/posts?${qs.toString()}`}
                          className={`rounded-lg px-4 py-2 ${
                            pageNum === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

