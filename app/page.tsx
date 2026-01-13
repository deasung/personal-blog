import { Metadata } from "next";
import PostCard from "@/app/components/PostCard";
import Header from "@/app/components/Header";
import { siteConfig } from "@/lib/site";
import { publicApi } from "@/lib/api-client";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default async function Home() {
  // API에서 최신 포스트 가져오기
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
  let apiError: string | null = null;

  try {
    const response = await publicApi.getPosts({ limit: 6 });
    if (response.success && response.data) {
      posts = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    apiError =
      error instanceof Error ? error.message : "API 서버에 연결할 수 없습니다.";
  }

  // 구조화된 데이터 (JSON-LD) - 웹사이트
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/posts?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // 구조화된 데이터 (JSON-LD) - 블로그
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    publisher: {
      "@type": "Person",
      name: siteConfig.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <section className="mb-16 text-center">
          {/*<h1 className="mb-4 text-5xl font-bold text-gray-900 dark:text-gray-100">*/}
          {/*  열심히..살아남자*/}
          {/*</h1>*/}
          <p className="text-xl text-gray-600 dark:text-gray-400">
            개발과 취미에 관한 이야기를 나누는 공간입니다.
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
              <div className="mt-4 space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p className="font-medium">해결 방법:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    API 서버를 실행하세요 (별도 포트, 예: 3002)
                    <br />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      현재 Next.js가 포트 3001에서 실행 중이므로 API 서버는 다른
                      포트(3002 등)를 사용해야 합니다.
                    </span>
                  </li>
                  <li>
                    프로젝트 루트에{" "}
                    <code className="rounded bg-yellow-100 px-1 py-0.5 text-xs dark:bg-yellow-900">
                      .env.local
                    </code>{" "}
                    파일을 생성하고 다음을 추가하세요:
                    <pre className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs overflow-x-auto">
                      {`NEXT_PUBLIC_API_URL=http://localhost:3002`}
                    </pre>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 block mt-1">
                      현재 설정된 값:{" "}
                      {process.env.NEXT_PUBLIC_API_URL || "설정되지 않음"}
                    </span>
                  </li>
                  <li>
                    Next.js 개발 서버를 재시작하세요 (환경 변수 변경 후 필수)
                  </li>
                </ol>
                <p className="mt-2 text-xs">
                  자세한 내용은{" "}
                  <code className="rounded bg-yellow-100 px-1 py-0.5 dark:bg-yellow-900">
                    README_API.md
                  </code>
                  를 참고하세요.
                </p>
              </div>
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
              {posts.length >= 6 && (
                <div className="mt-8 text-center">
                  <Link
                    href="/posts"
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
