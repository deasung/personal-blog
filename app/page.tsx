import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/app/components/PostCard";
import Header from "@/app/components/Header";
import { siteConfig } from "@/lib/site";

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

export default function Home() {
  const posts = getAllPosts().slice(0, 6); // 최신 6개만 표시

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
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <PostCard
                    key={post.slug}
                    slug={post.slug}
                    metadata={post.metadata}
                  />
                ))}
              </div>
              {getAllPosts().length > 6 && (
                <div className="mt-8 text-center">
                  <a
                    href="/posts"
                    className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    모든 포스트 보기
                  </a>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
