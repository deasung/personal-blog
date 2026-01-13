import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { categories, getAllCategoryIds } from "@/lib/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/posts/${post.slug}`,
    lastModified: new Date(post.metadata.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // 카테고리 페이지 추가
  const categoryEntries: MetadataRoute.Sitemap = getAllCategoryIds().map(
    (categoryId) => ({
      url: `${siteConfig.url}/categories/${categoryId}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // 서브카테고리 페이지 추가
  const subCategoryEntries: MetadataRoute.Sitemap = categories.flatMap(
    (category) =>
      (category.subcategories || []).map((subcategory) => ({
        url: `${siteConfig.url}/categories/${category.id}/${subcategory.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  );

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryEntries,
    ...subCategoryEntries,
    ...postEntries,
  ];
}
