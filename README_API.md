# API 연동 가이드

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API 서버 URL
# API 서버가 별도로 실행되는 경우 해당 URL을 설정하세요
VITE_PUBLIC_API_URL=http://localhost:4000
```

## API 서버 실행

이 블로그는 별도의 API 서버가 필요합니다. API 서버가 제공하는 엔드포인트:

### 공개 API (인증 불필요)

- `GET /public/posts` - 포스트 목록 조회
- `GET /public/posts/:slug` - 포스트 상세 조회
- `GET /public/categories` - 카테고리 목록 조회
- `GET /public/categories/:slug` - 카테고리 상세 조회
- `GET /public/tags` - 태그 목록 조회
- `GET /public/tags/:slug` - 태그 상세 조회
- `POST /public/admin.auth/login` - 어드민 로그인

### 어드민 API (JWT 토큰 필요)

- `GET /admin/posts` - 포스트 목록 조회
- `POST /admin/posts` - 포스트 생성
- `PUT /admin/posts/:id` - 포스트 수정
- `DELETE /admin/posts/:id` - 포스트 삭제
- `GET /admin/categories` - 카테고리 목록 조회
- `POST /admin/categories` - 카테고리 생성
- `PUT /admin/categories/:id` - 카테고리 수정
- `DELETE /admin/categories/:id` - 카테고리 삭제
- `GET /admin/tags` - 태그 목록 조회
- `POST /admin/tags` - 태그 생성
- `PUT /admin/tags/:id` - 태그 수정
- `DELETE /admin/tags/:id` - 태그 삭제

## API 서버가 없을 때

API 서버가 실행되지 않으면 블로그 페이지에 경고 메시지가 표시됩니다.
API 서버를 실행하거나 `.env` 파일에서 `VITE_PUBLIC_API_URL`을 올바른 값으로 설정하세요.

## 개발 모드

1. API 서버를 먼저 실행하세요 (포트 3001 또는 설정한 포트)
2. Vite 개발 서버 실행:
   ```bash
   npm run dev
   ```

## 문제 해결

### "API 엔드포인트를 찾을 수 없습니다" 에러

- API 서버가 실행 중인지 확인하세요
- `VITE_PUBLIC_API_URL` 환경 변수가 올바른지 확인하세요
- API 서버의 포트와 URL이 일치하는지 확인하세요

### "API 서버에 연결할 수 없습니다" 에러

- 네트워크 연결을 확인하세요
- API 서버가 다른 포트에서 실행 중인지 확인하세요
- 방화벽이나 CORS 설정을 확인하세요
