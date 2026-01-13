import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/categories";
import { siteConfig } from "@/lib/site";
import PostCard from "@/app/components/PostCard";
import Header from "@/app/components/Header";
import Link from "next/link";
import { publicApi } from "@/lib/api-client";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  // API에서 카테고리 목록 가져오기
  try {
    const response = await publicApi.getCategories();
    if (response.success && response.data) {
      return response.data.map((cat) => ({
        category: cat.slug,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch categories for static params:", error);
  }
  return [];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  let categoryData: { name: string; description?: string } | null = null;
  try {
    const response = await publicApi.getCategoryBySlug(category);
    if (response.success && response.data) {
      categoryData = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch category:", error);
  }

  if (!categoryData) {
    return {
      title: "카테고리를 찾을 수 없습니다",
    };
  }

  const title = `${categoryData.name} | ${siteConfig.name}`;
  const description =
    categoryData.description ||
    `${categoryData.name} 카테고리의 포스트 목록입니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/categories/${category}`,
      siteName: siteConfig.name,
      type: "website",
    },
    alternates: {
      canonical: `${siteConfig.url}/categories/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  let categoryData: { name: string; description?: string } | null = null;
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

  try {
    const categoryResponse = await publicApi.getCategoryBySlug(category);
    if (categoryResponse.success && categoryResponse.data) {
      categoryData = categoryResponse.data;
    }

    const postsResponse = await publicApi.getPosts({ category });
    if (postsResponse.success && postsResponse.data) {
      posts = postsResponse.data;
    }
  } catch (error) {
    console.error("Failed to fetch category data:", error);
  }

  if (!categoryData) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <Link
          href="/posts"
          className="mb-8 inline-block text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← 목록으로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            {categoryData.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {categoryData.name} 카테고리의 포스트 목록입니다.
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
