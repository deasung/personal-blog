import { Metadata } from "next";
import PostCard from "@/app/components/PostCard";
import Header from "@/app/components/Header";
import CategoryNav from "@/app/components/CategoryNav";
import { siteConfig } from "@/lib/site";
import { publicApi } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "모든 포스트",
  description: "개발과 취미에 관한 모든 글들을 확인하세요.",
  keywords: ["포스트", "블로그", "개발", "프로그래밍"],
  openGraph: {
    title: "모든 포스트",
    description: "개발과 취미에 관한 모든 글들을 확인하세요.",
    url: `${siteConfig.url}/posts`,
    siteName: siteConfig.name,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: "모든 포스트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "모든 포스트",
    description: "개발과 취미에 관한 모든 글들을 확인하세요.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
  alternates: {
    canonical: `${siteConfig.url}/posts`,
  },
};

interface PostsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
  }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  // API에서 포스트 가져오기
  let posts: Array<{
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: string;
    categoryName: string;
    categorySlug: string;
    tags: Array<{ id: string; name: string; slug: string }>;
  }> = [];
  let pagination = null;
  let apiError: string | null = null;

  try {
    const response = await publicApi.getPosts({
      page,
      limit: 12,
      category: params.category,
      tag: params.tag,
    });
    if (response.success && response.data) {
      posts = response.data;
      pagination = response.pagination;
    }
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    apiError =
      error instanceof Error ? error.message : "API 서버에 연결할 수 없습니다.";
  }

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
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ {apiError}
                </p>
                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  API 서버가 실행 중인지 확인하고,{" "}
                  <code className="rounded bg-yellow-100 px-1 py-0.5 text-xs dark:bg-yellow-900">
                    NEXT_PUBLIC_API_URL
                  </code>{" "}
                  환경 변수가 올바르게 설정되었는지 확인해주세요.
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">
                  아직 작성된 포스트가 없습니다.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                  API 서버에서 포스트를 가져올 수 없습니다.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      slug={post.slug}
                      metadata={{
                        title: post.title,
                        date: post.publishedAt,
                        description: post.excerpt,
                        category: post.categorySlug,
                        tags: post.tags.map((tag) => tag.name),
                      }}
                    />
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <a
                        key={pageNum}
                        href={`/posts?page=${pageNum}${
                          params.category ? `&category=${params.category}` : ""
                        }${params.tag ? `&tag=${params.tag}` : ""}`}
                        className={`rounded-lg px-4 py-2 ${
                          pageNum === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </a>
                    ))}
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
