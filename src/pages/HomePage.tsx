import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PostCard, { PostCardData } from "@/components/PostCard";
import { publicApi } from "@/lib/api-client";

type SettingsMap = Record<
  string,
  { id: number; value: string | null; createdAt: string; updatedAt: string }
>;

export default function HomePage() {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [settings, setSettings] = useState<SettingsMap | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [postsRes, settingsRes] = await Promise.all([
          publicApi.getPosts({ limit: 6, page: 1 }),
          publicApi.getSettings(),
        ]);

        if (!mounted) return;

        if (postsRes.success && postsRes.data) {
          setPosts(
            postsRes.data.map((p) => ({
              id: p.id,
              title: p.title,
              excerpt: p.excerpt,
              publishedAt: p.publishedAt,
              categorySlug: p.categorySlug,
              tags: p.tags.map((t) => t.name),
            }))
          );
        } else {
          setApiError(postsRes.message || "포스트를 불러올 수 없습니다.");
        }

        if (settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data);
        }
      } catch (e) {
        if (!mounted) return;
        setApiError(e instanceof Error ? e.message : "API 서버에 연결할 수 없습니다.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const siteTitle = useMemo(
    () => settings?.site_title?.value || "40대",
    [settings]
  );
  const siteDescription = useMemo(
    () =>
      settings?.site_description?.value ||
      "개발과 취미에 관한 이야기를 나누는 공간입니다.",
    [settings]
  );

  return (
    <>
      <Header title={siteTitle} />
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-16 sm:px-8">
        <div className="mb-16">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {siteTitle}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            {siteDescription}
          </p>
        </div>

        {apiError ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-6 py-4 dark:border-amber-900/50 dark:bg-amber-900/20">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              API 서버 연결 실패
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              {apiError}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              아직 작성된 포스트가 없습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {posts.length >= 6 && (
              <div className="mt-16 text-center">
                <Link
                  to="/posts"
                  className="inline-block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border-b border-gray-300 hover:border-gray-600 dark:border-gray-700 dark:hover:border-gray-400 pb-1"
                >
                  모든 포스트 보기 →
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

