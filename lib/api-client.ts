// API 클라이언트 유틸리티

// API 서버 URL 설정
// 개발 환경에서는 별도의 API 서버가 필요합니다
// 예: http://localhost:3002 (API 서버 포트, Next.js와 다른 포트 사용)
// 환경 변수가 설정되지 않으면 undefined로 설정하여 명확한 에러 메시지 표시
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || undefined;

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

// 공개 API 클라이언트
export class PublicApiClient {
  private baseUrl: string | undefined;

  constructor(baseUrl: string | undefined = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      throw new Error(
        "API 서버 URL이 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_API_URL을 설정하세요. 예: NEXT_PUBLIC_API_URL=http://localhost:3002"
      );
    }

    const url = `${this.baseUrl}${endpoint}`;

    console.log(url);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        // 타임아웃 설정 (10초)
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        // 404 에러인 경우 API 서버가 없을 수 있음
        if (response.status === 404) {
          const error: ApiError = {
            success: false,
            message: `API 엔드포인트를 찾을 수 없습니다: ${endpoint}`,
          };
          throw new Error(error.message);
        }

        const error: ApiError = await response.json().catch(() => ({
          success: false,
          message: `요청 처리 중 오류가 발생했습니다. (${response.status})`,
        }));
        throw new Error(error.message);
      }

      return response.json();
    } catch (error) {
      // 네트워크 에러나 타임아웃 등
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TypeError") {
          throw new Error(
            `API 서버에 연결할 수 없습니다. ${this.baseUrl}가 실행 중인지 확인해주세요.`
          );
        }
        // 이미 Error 객체인 경우 그대로 throw
        throw error;
      }
      // 알 수 없는 에러
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }

  // 헬스 체크
  async healthCheck() {
    return this.request<{ message: string; timestamp: string }>(
      "/public/health"
    );
  }

  // 어드민 로그인
  async login(email: string, password: string) {
    return this.request<{
      token: string;
      admin: {
        id: number;
        email: string;
        username: string;
        role: string;
      };
    }>("/public/admin.auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // 현재 어드민 정보 조회
  async getMe(token: string) {
    return this.request<{
      id: number;
      email: string;
      username: string;
      role: string;
      lastLoginAt: string;
      createdAt: string;
    }>("/public/admin.auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 카테고리 목록 조회
  async getCategories() {
    return this.request<
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

  // 카테고리 상세 조회
  async getCategoryBySlug(slug: string) {
    return this.request<{
      id: number;
      name: string;
      slug: string;
      description: string;
      createdAt: string;
      postsCount: number;
    }>(`/public/categories/${slug}`);
  }

  // 태그 목록 조회
  async getTags() {
    return this.request<
      Array<{
        id: number;
        name: string;
        slug: string;
        createdAt: string;
        postsCount: number;
      }>
    >("/public/tags");
  }

  // 태그 상세 조회
  async getTagBySlug(slug: string) {
    return this.request<{
      id: number;
      name: string;
      slug: string;
      createdAt: string;
      postsCount: number;
    }>(`/public/tags/${slug}`);
  }

  // 포스트 목록 조회
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

    return this.request<
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
        tags: Array<{
          id: number;
          name: string;
          slug: string;
        }>;
      }>
    >(endpoint);
  }

  // 포스트 상세 조회 (ID 기반)
  async getPostById(id: number) {
    return this.request<{
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
      tags: Array<{
        id: number;
        name: string;
        slug: string;
      }>;
    }>(`/public/posts/id/${id}`);
  }

  // 포스트 상세 조회 (slug 기반)
  async getPostBySlug(slug: string) {
    return this.request<{
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
      tags: Array<{
        id: number;
        name: string;
        slug: string;
      }>;
    }>(`/public/posts/${slug}`);
  }

  // 공개 설정 조회
  async getSettings() {
    return this.request<
      Record<
        string,
        {
          id: number;
          value: string | null;
          createdAt: string;
          updatedAt: string;
        }
      >
    >("/public/settings");
  }
}

// 어드민 API 클라이언트
export class AdminApiClient {
  private baseUrl: string | undefined;
  private token: string;

  constructor(token: string, baseUrl: string | undefined = API_BASE_URL) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      throw new Error(
        "API 서버 URL이 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_API_URL을 설정하세요."
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        success: false,
        message: "요청 처리 중 오류가 발생했습니다.",
      }));
      throw new Error(error.message);
    }

    return response.json();
  }

  // 카테고리 목록 조회
  async getCategories() {
    return this.request<
      Array<{
        id: number;
        name: string;
        slug: string;
        description: string;
        createdAt: string;
        updatedAt: string;
      }>
    >("/admin/categories");
  }

  // 카테고리 생성
  async createCategory(data: { name: string; description?: string }) {
    return this.request<{
      id: number;
      name: string;
      slug: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    }>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 카테고리 수정
  async updateCategory(
    id: number,
    data: { name: string; description?: string }
  ) {
    return this.request<{
      id: number;
      name: string;
      slug: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    }>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 카테고리 삭제
  async deleteCategory(id: number) {
    return this.request<void>(`/admin/categories/${id}`, {
      method: "DELETE",
    });
  }

  // 태그 목록 조회
  async getTags() {
    return this.request<
      Array<{
        id: number;
        name: string;
        slug: string;
        createdAt: string;
        updatedAt: string;
      }>
    >("/admin/tags");
  }

  // 태그 생성
  async createTag(data: { name: string }) {
    return this.request<{
      id: number;
      name: string;
      slug: string;
      createdAt: string;
      updatedAt: string;
    }>("/admin/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 태그 수정
  async updateTag(id: number, data: { name: string }) {
    return this.request<{
      id: number;
      name: string;
      slug: string;
      createdAt: string;
      updatedAt: string;
    }>(`/admin/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 태그 삭제
  async deleteTag(id: number) {
    return this.request<void>(`/admin/tags/${id}`, {
      method: "DELETE",
    });
  }

  // 포스트 목록 조회
  async getPosts(params?: {
    page?: number;
    limit?: number;
    published?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.published !== undefined)
      queryParams.append("published", params.published.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/posts${queryString ? `?${queryString}` : ""}`;

    return this.request<
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
        tags: Array<{
          id: number;
          name: string;
          slug: string;
        }>;
      }>
    >(endpoint);
  }

  // 포스트 생성
  async createPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    thumbnail?: string | null;
    categoryId: number;
    published?: boolean;
    tagIds?: number[];
  }) {
    return this.request<{
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
      tags: Array<{
        id: number;
        name: string;
        slug: string;
      }>;
    }>("/admin/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 포스트 수정
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
    return this.request<{
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
      tags: Array<{
        id: number;
        name: string;
        slug: string;
      }>;
    }>(`/admin/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 포스트 삭제
  async deletePost(id: number) {
    return this.request<void>(`/admin/posts/${id}`, {
      method: "DELETE",
    });
  }

  // 설정 조회
  async getSettings() {
    return this.request<
      Record<
        string,
        {
          id: number;
          value: string | null;
          createdAt: string;
          updatedAt: string;
        }
      >
    >("/admin/settings");
  }

  // 설정 수정 (부분 업데이트)
  // - 백엔드가 { settings: {...} } 또는 { key: value } 형태를 모두 허용하므로
  //   확장 포맷인 { settings }로 보내도록 통일
  async updateSettings(settings: Record<string, unknown>) {
    return this.request<
      Record<
        string,
        {
          id: number;
          value: string | null;
          createdAt: string;
          updatedAt: string;
        }
      >
    >("/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    });
  }
}

// 싱글톤 인스턴스
export const publicApi = new PublicApiClient();
