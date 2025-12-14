import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostsByCategory } from '@/lib/posts';
import { getCategoryById, getCategoryPath } from '@/lib/categories';
import { siteConfig } from '@/lib/site';
import PostCard from '@/app/components/PostCard';
import Header from '@/app/components/Header';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const { getAllCategoryIds } = await import('@/lib/categories');
  return getAllCategoryIds().map((categoryId) => ({
    category: categoryId,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = getCategoryById(category);

  if (!categoryData) {
    return {
      title: '카테고리를 찾을 수 없습니다',
    };
  }

  const title = `${categoryData.name} | ${siteConfig.name}`;
  const description = `${categoryData.name} 카테고리의 포스트 목록입니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/categories/${category}`,
      siteName: siteConfig.name,
      type: 'website',
    },
    alternates: {
      canonical: `${siteConfig.url}/categories/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = getCategoryById(category);

  if (!categoryData) {
    notFound();
  }

  const posts = getPostsByCategory(category);

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
              <PostCard key={post.slug} slug={post.slug} metadata={post.metadata} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

