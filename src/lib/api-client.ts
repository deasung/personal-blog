const DEFAULT_API_BASE_URL =
  "https://0ueo0wph68.execute-api.ap-northeast-2.amazonaws.com/production";

export function getApiBaseUrl(): string {
  const url =
    import.meta.env.VITE_PUBLIC_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return String(url).replace(/\/+$/, "");
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError {
  success: false;
  message: string;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  token?: string
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      success: false,
      message: `요청 처리 중 오류가 발생했습니다. (${response.status})`,
    }));
    throw new Error(error.message);
  }
  return response.json();
}

export class PublicApiClient {
  async login(email: string, password: string) {
    return request<{
      token: string;
      admin: { id: number; email: string; username: string; role: string };
    }>("/public/admin.auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getSettings() {
    return request<
      Record<
        string,
        { id: number; value: string | null; createdAt: string; updatedAt: string }
      >
    >("/public/settings");
  }

  async getCategories() {
    return request<
      Array<{
        id: number;
        name: string;
        slug: string;
        description: string;
        createdAt: string;
        postsCount?: number;
      }>
    >("/public/categories");
  }

  async getCategoryBySlug(slug: string) {
    return request<{
      id: number;
      name: string;
      slug: string;
      description: string;
      createdAt: string;
      postsCount: number;
    }>(`/public/categories/${slug}`);
  }

  async getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.tag) queryParams.append("tag", params.tag);
    const queryString = queryParams.toString();
    const endpoint = `/public/posts${queryString ? `?${queryString}` : ""}`;

    return request<
      Array<{
        id: number;
        title: string;
        thumbnail?: string | null;
        excerpt: string;
        slug: string;
        publishedAt: string;
        createdAt: string;
        categoryId: number;
        categoryName: string;
        categorySlug: string;
        tags: Array<{ id: number; name: string; slug: string }>;
      }>
    >(endpoint);
  }

  async getPostById(id: number) {
    return request<{
      id: number;
      title: string;
      thumbnail?: string | null;
      content: string;
      excerpt: string;
      slug: string;
      publishedAt: string;
      createdAt: string;
      updatedAt: string;
      categoryId: number;
      categoryName: string;
      categorySlug: string;
      tags: Array<{ id: number; name: string; slug: string }>;
    }>(`/public/posts/id/${id}`);
  }
}

export class AdminApiClient {
  private token: string;
  constructor(token: string) {
    this.token = token;
  }

  async getCategories() {
    return request<
      Array<{
        id: number;
        name: string;
        slug: string;
        description: string;
        createdAt: string;
        updatedAt: string;
      }>
    >("/admin/categories", undefined, this.token);
  }

  async createCategory(data: { name: string; description?: string }) {
    return request("/admin/categories", { method: "POST", body: JSON.stringify(data) }, this.token);
  }

  async updateCategory(id: number, data: { name: string; description?: string }) {
    return request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }, this.token);
  }

  async deleteCategory(id: number) {
    return request<void>(`/admin/categories/${id}`, { method: "DELETE" }, this.token);
  }

  async getTags() {
    return request<
      Array<{ id: number; name: string; slug: string; createdAt: string; updatedAt: string }>
    >("/admin/tags", undefined, this.token);
  }

  async createTag(data: { name: string }) {
    return request("/admin/tags", { method: "POST", body: JSON.stringify(data) }, this.token);
  }

  async updateTag(id: number, data: { name: string }) {
    return request(`/admin/tags/${id}`, { method: "PUT", body: JSON.stringify(data) }, this.token);
  }

  async deleteTag(id: number) {
    return request<void>(`/admin/tags/${id}`, { method: "DELETE" }, this.token);
  }

  async getPosts(params?: { page?: number; limit?: number; published?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.published !== undefined) queryParams.append("published", params.published.toString());
    const queryString = queryParams.toString();
    const endpoint = `/admin/posts${queryString ? `?${queryString}` : ""}`;

    return request<
      Array<{
        id: number;
        title: string;
        thumbnail?: string | null;
        content: string;
        excerpt: string;
        slug: string;
        published: boolean;
        publishedAt: string | null;
        createdAt: string;
        updatedAt: string;
        categoryId: number;
        categoryName: string;
        categorySlug: string;
        tags: Array<{ id: number; name: string; slug: string }>;
      }>
    >(endpoint, undefined, this.token);
  }

  async createPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    thumbnail?: string | null;
    categoryId: number;
    published?: boolean;
    tagIds?: number[];
  }) {
    return request("/admin/posts", { method: "POST", body: JSON.stringify(data) }, this.token);
  }

  async updatePost(
    id: number,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      thumbnail?: string | null;
      categoryId?: number;
      published?: boolean;
      tagIds?: number[];
    }
  ) {
    return request(`/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }, this.token);
  }

  async deletePost(id: number) {
    return request<void>(`/admin/posts/${id}`, { method: "DELETE" }, this.token);
  }

  async getSettings() {
    return request<
      Record<
        string,
        { id: number; value: string | null; createdAt: string; updatedAt: string }
      >
    >("/admin/settings", undefined, this.token);
  }

  async updateSettings(settings: Record<string, unknown>) {
    return request(
      "/admin/settings",
      { method: "PUT", body: JSON.stringify({ settings }) },
      this.token
    );
  }
}

export const publicApi = new PublicApiClient();

