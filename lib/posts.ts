import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";

const postsDirectory = path.join(process.cwd(), "posts");

export interface PostMetadata {
  title: string;
  date: string;
  description?: string;
  category?: string; // 1차 카테고리 ID
  subcategory?: string; // 2차 카테고리 ID
  tags?: string[];
}

export interface Post {
  slug: string;
  metadata: PostMetadata;
  content: string;
}

// 재귀적으로 마크다운 파일 찾기
function getAllMarkdownFiles(dir: string, basePath: string = ""): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // 디렉토리인 경우 재귀적으로 탐색
      files.push(...getAllMarkdownFiles(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      // 마크다운 파일인 경우
      files.push(relativePath.replace(/\.md$/, ""));
    }
  }

  return files;
}

export function getPostSlugs(): string[] {
  return getAllMarkdownFiles(postsDirectory);
}

export function getPostBySlug(slug: string): Post | null {
  // slug는 카테고리/파일명 형식일 수 있음 (예: "infrastructure/aws-basics")
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // 폴더 구조에서 카테고리 자동 추출 (프론트매터에 없을 경우)
  const slugParts = slug.split("/");
  let autoCategory: string | undefined;
  let autoSubCategory: string | undefined;

  if (slugParts.length >= 2) {
    // 첫 번째 폴더가 카테고리 ID인지 확인
    autoCategory = slugParts[0];
    // 두 번째 폴더가 서브카테고리 ID일 수 있음 (하지만 파일명일 수도 있음)
    // 여기서는 첫 번째 폴더만 카테고리로 사용
  }

  // 날짜를 ISO 8601 형식으로 정규화
  // YYYY-MM-DD 형식이면 그대로 사용, 아니면 ISO 형식으로 변환
  let normalizedDate: string;
  if (data.date) {
    // 이미 ISO 형식이거나 YYYY-MM-DD 형식인 경우
    if (typeof data.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(data.date)) {
      // YYYY-MM-DD 형식이면 UTC 자정으로 변환하여 ISO 형식으로 만들기
      normalizedDate = new Date(data.date + "T00:00:00Z").toISOString();
    } else {
      // 다른 형식이면 Date 객체로 파싱 후 ISO 형식으로 변환
      normalizedDate = new Date(data.date).toISOString();
    }
  } else {
    normalizedDate = new Date().toISOString();
  }

  return {
    slug,
    metadata: {
      title: data.title || "Untitled",
      date: normalizedDate,
      description: data.description || "",
      // 프론트매터에 카테고리가 있으면 우선 사용, 없으면 폴더 구조에서 추출
      category: data.category || autoCategory,
      subcategory: data.subcategory || autoSubCategory,
      tags: data.tags || [],
    },
    content,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      return (
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime()
      );
    });

  return posts;
}

export async function getPostContentWithHtml(post: Post): Promise<string> {
  const processedContent = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(post.content);

  return processedContent.toString();
}

// 카테고리별 포스트 필터링
export function getPostsByCategory(
  categoryId: string,
  subCategoryId?: string
): Post[] {
  const allPosts = getAllPosts();

  if (subCategoryId) {
    return allPosts.filter(
      (post) =>
        post.metadata.category === categoryId &&
        post.metadata.subcategory === subCategoryId
    );
  }

  return allPosts.filter((post) => post.metadata.category === categoryId);
}

// 모든 카테고리별 포스트 개수
export function getCategoryPostCounts(): Record<string, number> {
  const allPosts = getAllPosts();
  const counts: Record<string, number> = {};

  allPosts.forEach((post) => {
    if (post.metadata.category) {
      const key = post.metadata.subcategory
        ? `${post.metadata.category}/${post.metadata.subcategory}`
        : post.metadata.category;
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  return counts;
}
