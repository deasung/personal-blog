import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/app/components/PostCard";
import Header from "@/app/components/Header";
import CategoryNav from "@/app/components/CategoryNav";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "모든 포스트",
  description: "개발과 취미에 관한 모든 글들을 확인하세요.",
  openGraph: {
    title: "모든 포스트",
    description: "개발과 취미에 관한 모든 글들을 확인하세요.",
    url: `${siteConfig.url}/posts`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: `${siteConfig.url}/posts`,
  },
};

export default function PostsPage() {
  const posts = getAllPosts();

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
            {posts.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">
                  아직 작성된 포스트가 없습니다.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                  posts 디렉토리에 마크다운 파일을 추가해보세요.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <PostCard
                    key={post.slug}
                    slug={post.slug}
                    metadata={post.metadata}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
