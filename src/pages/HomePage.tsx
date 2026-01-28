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
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <section className="mb-16 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {siteDescription}
          </p>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            최신 포스트
          </h2>

          {apiError ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                ⚠️ API 서버 연결 실패
              </p>
              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                {apiError}
              </p>
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
              {posts.length >= 6 && (
                <div className="mt-8 text-center">
                  <Link
                    to="/posts"
                    className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    모든 포스트 보기
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

