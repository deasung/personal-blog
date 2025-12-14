# 개발 블로그

Next.js와 마크다운을 사용한 개인 개발 블로그입니다.

## 주요 기능

- 📝 마크다운 기반 포스트 작성
- 🎨 코드 하이라이팅 지원
- 🌙 다크 모드 지원
- 📱 반응형 디자인
- ⚡ Next.js App Router 사용
- 🚀 Vercel 배포 최적화
- 🔍 **SEO 최적화** (메타데이터, 구조화된 데이터, 사이트맵, robots.txt)
- 📊 **서버사이드 렌더링 (SSR/SSG)** - 모든 페이지가 정적으로 생성되어 검색 엔진 최적화

## 시작하기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 포스트 작성하기

`posts` 디렉토리에 마크다운 파일을 추가하면 자동으로 블로그 포스트로 등록됩니다.

#### 포스트 파일 형식

```markdown
---
title: 포스트 제목
date: 2024-01-15
description: 포스트 설명
category: 개발
tags: [태그1, 태그2]
---

# 포스트 내용

여기에 마크다운으로 작성한 내용이 표시됩니다.
```

## 프로젝트 구조

```
personal-blog/
├── app/                 # Next.js App Router
│   ├── components/      # 재사용 가능한 컴포넌트
│   ├── posts/          # 포스트 관련 페이지
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 홈 페이지
├── lib/                # 유틸리티 함수
│   └── posts.ts        # 포스트 관련 함수
├── posts/              # 마크다운 포스트 파일들
└── public/             # 정적 파일
```

## 배포

### Vercel에 배포하기

1. GitHub에 저장소를 푸시합니다.
2. [Vercel](https://vercel.com)에 로그인합니다.
3. "New Project"를 클릭하고 GitHub 저장소를 선택합니다.
4. Vercel이 자동으로 설정을 감지하고 배포를 시작합니다.

### 환경 변수

Vercel 배포 시 자동으로 `NEXT_PUBLIC_SITE_URL`이 설정됩니다. 로컬 개발 시에는 `lib/site.ts` 파일에서 사이트 URL을 수정하세요.

## SEO 최적화 기능

이 블로그는 검색 엔진 최적화를 위해 다음과 같은 기능을 포함합니다:

- ✅ **동적 메타데이터**: 각 포스트마다 고유한 title, description, Open Graph 태그
- ✅ **구조화된 데이터 (JSON-LD)**: Schema.org BlogPosting 스키마로 검색 엔진이 콘텐츠를 이해하기 쉽게 함
- ✅ **사이트맵**: `/sitemap.xml` 자동 생성
- ✅ **robots.txt**: `/robots.txt` 자동 생성
- ✅ **Canonical URL**: 중복 콘텐츠 방지
- ✅ **Semantic HTML**: article, time 등 시맨틱 태그 사용
- ✅ **서버사이드 렌더링**: 모든 페이지가 빌드 시 정적으로 생성되어 빠른 로딩과 SEO 최적화

## 기술 스택

- **Next.js 16** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **gray-matter** - 마크다운 프론트매터 파싱
- **remark/rehype** - 마크다운 처리 및 HTML 변환
- **highlight.js** - 코드 하이라이팅
- **date-fns** - 날짜 포맷팅

## 라이선스

MIT
