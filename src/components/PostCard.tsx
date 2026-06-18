import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { MouseEvent } from "react";

export interface PostCardData {
  id: number;
  title: string;
  excerpt: string;
  publishedAt: string;
  categorySlug: string;
  tags: string[];
}

export default function PostCard({ post }: { post: PostCardData }) {
  const dateObj = new Date(post.publishedAt);
  const formattedDate = isNaN(dateObj.getTime())
    ? post.publishedAt
    : format(dateObj, "yyyy.MM.dd", { locale: ko });

  return (
    <article className="border-b border-gray-200 py-7 transition-opacity hover:opacity-75 dark:border-gray-800">
      <Link to={`/posts/${post.id}`} className="block group">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {post.categorySlug && (
              <Link
                to={`/categories/${post.categorySlug}`}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                className="inline-block text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {post.categorySlug}
              </Link>
            )}
            <time className="text-xs text-gray-400 dark:text-gray-500">
              {formattedDate}
            </time>
          </div>

          <h2 className="text-xl font-bold leading-snug text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

