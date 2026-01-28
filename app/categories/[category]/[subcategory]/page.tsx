import { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site";
import PostCard from "@/app/components/PostCard";
import Header from "@/app/components/Header";
import Link from "next/link";
import { publicApi } from "@/lib/api-client";

interface SubCategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export async function generateStaticParams() {
  // API에서 카테고리 목록 가져오기
  // 서브카테고리는 API 구조에 따라 달라질 수 있음
  // 임시로 빈 배열 반환 (동적 생성)
  return [];
}

export async function generateMetadata({
  params,
}: SubCategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;

  // API에서 카테고리 정보 가져오기
  // 서브카테고리는 API 구조에 따라 달라질 수 있음
  const title = `${category}/${subcategory} | ${siteConfig.name}`;
  const description = `${category}/${subcategory} 카테고리의 포스트 목록입니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/categories/${category}/${subcategory}`,
      siteName: siteConfig.name,
      type: "website",
    },
    alternates: {
      canonical: `${siteConfig.url}/categories/${category}/${subcategory}`,
    },
  };
}

export default async function SubCategoryPage({
  params,
}: SubCategoryPageProps) {
  const { category, subcategory } = await params;

  let posts: Array<{
    id: number;
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: string;
    categoryName: string;
    categorySlug: string;
    tags: Array<{ id: number; name: string; slug: string }>;
  }> = [];

  try {
    // API에서 해당 카테고리/서브카테고리의 포스트 가져오기
    // 서브카테고리 필터링은 API 구조에 따라 달라질 수 있음
    const postsResponse = await publicApi.getPosts({ category });
    if (postsResponse.success && postsResponse.data) {
      // 서브카테고리로 필터링 (API가 서브카테고리를 지원하지 않으면 클라이언트에서 필터링)
      posts = postsResponse.data.filter(
        (post) =>
          post.categorySlug === `${category}/${subcategory}` ||
          post.categorySlug === subcategory
      );
    }
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  const categoryPath = `${category}/${subcategory}`;

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <div className="mb-4">
          <Link
            href={`/categories/${category}`}
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

        {posts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              이 카테고리에 아직 포스트가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
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
        )}
      </main>
    </>
  );
}
