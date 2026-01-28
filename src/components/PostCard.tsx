import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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
    : format(dateObj, "yyyy년 M월 d일", { locale: ko });

  return (
    <article className="rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
      <div className="p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {post.categorySlug && (
            <Link
              to={`/categories/${post.categorySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
            >
              {post.categorySlug}
            </Link>
          )}
          <time
            dateTime={post.publishedAt}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {formattedDate}
          </time>
        </div>

        <Link to={`/posts/${post.id}`} className="group block">
          <h2 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-400">{post.excerpt}</p>
          )}
        </Link>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

