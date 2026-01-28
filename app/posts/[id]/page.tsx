import { notFound } from "next/navigation";
import { Metadata } from "next";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Header from "@/app/components/Header";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { publicApi } from "@/lib/api-client";

// 동적 라우팅 활성화 (런타임에 생성된 포스트도 처리)
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    return {
      title: "포스트를 찾을 수 없습니다",
    };
  }

  let post: {
    title: string;
    excerpt: string;
    thumbnail?: string | null;
    publishedAt: string;
    tags: Array<{ name: string }>;
    categorySlug?: string;
  } | null = null;

  try {
    const response = await publicApi.getPostById(postId);
    if (response.success && response.data) {
      post = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch post:", error);
  }

  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다",
    };
  }

  const title = `${post.title} | ${siteConfig.name}`;
  const description = post.excerpt || siteConfig.description;
  const url = `${siteConfig.url}/posts/${id}`;
  const publishedTime = new Date(post.publishedAt).toISOString();

  // Open Graph 이미지 URL 생성 (포스트에 이미지가 있으면 사용, 없으면 기본 이미지)
  const ogImage = post.thumbnail || `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "article",
      publishedTime,
      authors: [siteConfig.name],
      tags: post.tags.map((tag) => tag.name),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    keywords: post.tags.map((tag) => tag.name).join(", "),
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  let post: {
    id: number;
    title: string;
    thumbnail?: string | null;
    content: string;
    excerpt: string;
    slug: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    tags: Array<{ id: number; name: string; slug: string }>;
  } | null = null;
  let apiError: string | null = null;

  try {
    const response = await publicApi.getPostById(postId);
    if (response.success && response.data) {
      post = response.data;
    } else {
      apiError = response.message || "포스트를 찾을 수 없습니다.";
    }
  } catch (error) {
    console.error("Failed to fetch post:", error);
    apiError =
      error instanceof Error ? error.message : "API 서버에 연결할 수 없습니다.";
  }

  if (!post) {
    if (apiError) {
      // API 에러인 경우 에러 페이지 표시
      return (
        <>
          <Header />
          <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-yellow-800 dark:text-yellow-200">
                ⚠️ {apiError}
              </p>
              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                요청한 ID:{" "}
                <code className="rounded bg-yellow-100 px-1 py-0.5 text-xs dark:bg-yellow-900">
                  {id}
                </code>
              </p>
              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                API 서버가 실행 중인지 확인하고,{" "}
                <code className="rounded bg-yellow-100 px-1 py-0.5 text-xs dark:bg-yellow-900">
                  NEXT_PUBLIC_API_URL
                </code>{" "}
                환경 변수가 올바르게 설정되었는지 확인해주세요.
              </p>
              <Link
                href="/posts"
                className="mt-4 inline-block text-sm text-yellow-800 underline dark:text-yellow-200"
              >
                ← 포스트 목록으로 돌아가기
              </Link>
            </div>
          </main>
        </>
      );
    }
    // 포스트를 찾을 수 없는 경우 404
    notFound();
  }

  // API에서 받은 content가 이미 HTML이므로 그대로 사용
  const content = post.content;
  const dateObj = new Date(post.publishedAt);
  const formattedDate = format(dateObj, "yyyy년 M월 d일", {
    locale: ko,
  });

  // 구조화된 데이터 (JSON-LD) - BlogPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    image: post.thumbnail || `${siteConfig.url}${siteConfig.ogImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/posts/${id}`,
    },
    keywords: post.tags.map((tag) => tag.name).join(", ") || "",
    articleSection: post.categorySlug || "",
    inLanguage: "ko-KR",
  };

  // Breadcrumb 구조화된 데이터
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "포스트",
        item: `${siteConfig.url}/posts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteConfig.url}/posts/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <Link
          href="/posts"
          className="mb-8 inline-block text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← 목록으로 돌아가기
        </Link>

        <article className="prose prose-lg max-w-none dark:prose-invert">
          <div className="mb-6 flex items-center gap-2">
            {post.categorySlug && (
              <Link
                href={`/categories/${post.categorySlug}`}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
              >
                {post.categoryName}
              </Link>
            )}
            <time
              dateTime={post.publishedAt}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {formattedDate}
            </time>
          </div>

          {post.thumbnail && (
            <div className="not-prose mb-8">
              <div className="relative h-64 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <Image
                  src={post.thumbnail}
                  alt={`${post.title} 대표 썸네일`}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  priority
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
                  href={`/posts?tag=${tag.slug}`}
                  className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm dark:prose-code:bg-gray-800"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </main>
    </>
  );
}
