import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Header from "@/components/Header";
import { publicApi } from "@/lib/api-client";

export default function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const [post, setPost] = useState<Awaited<ReturnType<typeof publicApi.getPostById>>["data"] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || Number.isNaN(postId)) {
      setApiError("포스트 ID가 올바르지 않습니다.");
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await publicApi.getPostById(postId);
        if (!mounted) return;
        if (res.success && res.data) {
          setPost(res.data);
          setApiError(null);
        } else {
          setApiError(res.message || "포스트를 찾을 수 없습니다.");
        }
      } catch (e) {
        if (!mounted) return;
        setApiError(e instanceof Error ? e.message : "API 서버에 연결할 수 없습니다.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const formattedDate = useMemo(() => {
    if (!post?.publishedAt) return "";
    const dateObj = new Date(post.publishedAt);
    return format(dateObj, "yyyy년 M월 d일", { locale: ko });
  }, [post]);

  if (apiError) {
    return (
      <>
        <Header />
        <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-200">⚠️ {apiError}</p>
            <Link to="/posts" className="mt-4 inline-block text-sm underline">
              ← 포스트 목록으로 돌아가기
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <Link
          to="/posts"
          className="mb-8 inline-block text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← 목록으로 돌아가기
        </Link>

        <article className="prose prose-lg max-w-none dark:prose-invert">
          <div className="mb-6 flex items-center gap-2">
            {post.categorySlug && (
              <Link
                to={`/categories/${post.categorySlug}`}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
              >
                {post.categoryName}
              </Link>
            )}
            <time dateTime={post.publishedAt} className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </time>
          </div>

          {post.thumbnail && (
            <div className="not-prose mb-8">
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <img
                  src={post.thumbnail}
                  alt={`${post.title} 대표 썸네일`}
                  className="h-64 w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          )}

          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/posts?tag=${tag.slug}`}
                  className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
}

