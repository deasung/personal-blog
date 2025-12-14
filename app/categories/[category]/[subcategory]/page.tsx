import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByCategory } from '@/lib/posts';
import { getCategoryById, getSubCategoryById, getCategoryPath } from '@/lib/categories';
import { siteConfig } from '@/lib/site';
import PostCard from '@/app/components/PostCard';
import Header from '@/app/components/Header';
import Link from 'next/link';

interface SubCategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export async function generateStaticParams() {
  const { categories } = await import('@/lib/categories');
  const params: { category: string; subcategory: string }[] = [];
  
  categories.forEach((category) => {
    if (category.subcategories) {
      category.subcategories.forEach((subcategory) => {
        params.push({
          category: category.id,
          subcategory: subcategory.id,
        });
      });
    }
  });
  
  return params;
}

export async function generateMetadata({ params }: SubCategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const categoryData = getCategoryById(category);
  const subCategoryData = getSubCategoryById(category, subcategory);

  if (!categoryData || !subCategoryData) {
    return {
      title: '카테고리를 찾을 수 없습니다',
    };
  }

  const categoryPath = getCategoryPath(category, subcategory);
  const title = `${categoryPath} | ${siteConfig.name}`;
  const description = `${categoryPath} 카테고리의 포스트 목록입니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/categories/${category}/${subcategory}`,
      siteName: siteConfig.name,
      type: 'website',
    },
    alternates: {
      canonical: `${siteConfig.url}/categories/${category}/${subcategory}`,
    },
  };
}

export default async function SubCategoryPage({ params }: SubCategoryPageProps) {
  const { category, subcategory } = await params;
  const categoryData = getCategoryById(category);
  const subCategoryData = getSubCategoryById(category, subcategory);

  if (!categoryData || !subCategoryData) {
    notFound();
  }

  const posts = getPostsByCategory(category, subcategory);
  const categoryPath = getCategoryPath(category, subcategory);

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
        <div className="mb-4">
          <Link
            href={`/categories/${category}`}
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← {categoryData.name}로 돌아가기
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
              <PostCard key={post.slug} slug={post.slug} metadata={post.metadata} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

