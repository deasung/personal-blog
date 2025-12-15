// 카테고리 구조 정의
export interface Category {
  id: string;
  name: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}

// 카테고리 데이터
export const categories: Category[] = [
  {
    id: "infrastructure",
    name: "인프라",
    subcategories: [
      { id: "aws", name: "AWS" },
      { id: "n8n", name: "n8n" },
    ],
  },
  {
    id: "database",
    name: "데이터베이스",
    subcategories: [{ id: "mysql", name: "MySQL" }],
  },
  {
    id: "backend",
    name: "백엔드",
    subcategories: [
      { id: "spring-boot", name: "스프링부트" },
      { id: "fastapi", name: "FastAPI" },
    ],
  },
  {
    id: "frontend",
    name: "프런트엔드",
    subcategories: [
      { id: "nextjs", name: "Next.js" },
      { id: "react-native", name: "React Native" },
      { id: "android", name: "Android" },
    ],
  },
  {
    id: "book-review",
    name: "책 리뷰",
    subcategories: [{ id: "development-book", name: "개발책" }],
  },
];

// 카테고리 ID로 카테고리 찾기
export function getCategoryById(id: string): Category | undefined {
  return categories.find((cat) => cat.id === id);
}

// 서브카테고리 ID로 서브카테고리 찾기
export function getSubCategoryById(
  categoryId: string,
  subCategoryId: string
): SubCategory | undefined {
  const category = getCategoryById(categoryId);
  return category?.subcategories?.find((sub) => sub.id === subCategoryId);
}

// 모든 카테고리 ID 목록
export function getAllCategoryIds(): string[] {
  return categories.map((cat) => cat.id);
}

// 카테고리별 서브카테고리 ID 목록
export function getSubCategoryIds(categoryId: string): string[] {
  const category = getCategoryById(categoryId);
  return category?.subcategories?.map((sub) => sub.id) || [];
}

// 카테고리 경로 생성 (예: "인프라/AWS")
export function getCategoryPath(
  categoryId: string,
  subCategoryId?: string
): string {
  const category = getCategoryById(categoryId);
  if (!category) return "";

  if (subCategoryId) {
    const subCategory = getSubCategoryById(categoryId, subCategoryId);
    return subCategory ? `${category.name}/${subCategory.name}` : category.name;
  }

  return category.name;
}
