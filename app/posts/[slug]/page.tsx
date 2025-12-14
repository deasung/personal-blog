import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAllPosts, getPostBySlug, getPostContentWithHtml } from '@/lib/posts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Header from '@/app/components/Header';
import Link from 'next/link';
import { siteConfig } from '@/lib/site';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    };
  }

  const title = `${post.metadata.title} | ${siteConfig.name}`;
  const description = post.metadata.description || siteConfig.description;
  const url = `${siteConfig.url}/posts/${slug}`;
  const publishedTime = new Date(post.metadata.date).toISOString();

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
      type: 'article',
      publishedTime,
      authors: [siteConfig.name],
      tags: post.metadata.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: post.metadata.tags?.join(', '),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await getPostContentWithHtml(post);
  const dateObj = new Date(post.metadata.date);
  const formattedDate = format(dateObj, 'yyyy년 M월 d일', {
    locale: ko,
  });

  // 구조화된 데이터 (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    description: post.metadata.description || '',
    image: `${siteConfig.url}/og-image.png`,
    datePublished: post.metadata.date,
    dateModified: post.metadata.date,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/posts/${slug}`,
    },
    keywords: post.metadata.tags?.join(', ') || '',
    articleSection: post.metadata.category || '',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
            {post.metadata.category && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {post.metadata.category}
              </span>
            )}
            <time dateTime={post.metadata.date} className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </time>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            {post.metadata.title}
          </h1>

          {post.metadata.description && (
            <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
              {post.metadata.description}
            </p>
          )}

          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  #{tag}
                </span>
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


