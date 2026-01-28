import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { PostMetadata } from "@/lib/posts";

interface PostCardProps {
  id: number;
  slug?: string; // slug는 선택적 (하위 호환성)
  metadata: PostMetadata;
}

export default function PostCard({ id, slug, metadata }: PostCardProps) {
  // ISO 8601 형식의 날짜를 사용하여 서버/클라이언트 일관성 보장
  // metadata.date는 이미 ISO 형식으로 정규화되어 있음
  const isoDate = metadata.date;

  // 날짜 포맷팅 - 서버/클라이언트 일관성을 위해 ISO 문자열을 직접 파싱
  // ISO 형식이므로 UTC 기준으로 파싱되어 일관성 보장
  const dateObj = new Date(isoDate);

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date:", metadata.date);
  }

  const formattedDate = format(dateObj, "yyyy년 M월 d일", {
    locale: ko,
  });

  // 카테고리 정보 (API에서 받은 categorySlug 사용)
  const categoryUrl = metadata.category
    ? `/categories/${metadata.category}`
    : null;

  // ID 기반으로 상세 페이지 링크 생성
  const postUrl = `/posts/${id}`;

  return (
    <article className="rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
      <div className="p-6">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          {metadata.category && categoryUrl && (
            <Link
              href={categoryUrl}
              onClick={(e) => e.stopPropagation()}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
            >
              {metadata.category}
            </Link>
          )}
          <time
            dateTime={isoDate}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {formattedDate}
          </time>
        </div>
        <Link href={postUrl} className="group block">
          <h2 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
            {metadata.title}
          </h2>
          {metadata.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {metadata.description}
            </p>
          )}
        </Link>
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
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
