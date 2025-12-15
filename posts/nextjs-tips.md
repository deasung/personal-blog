---
title: Next.js 개발 팁
date: 2024-01-20
description: Next.js를 사용하면서 유용한 팁들을 정리했습니다.
category: frontend
tags: [Next.js, React, 웹개발]
---

# Next.js 개발 팁

Next.js를 사용하면서 알게 된 유용한 팁들을 공유합니다.

## 1. 이미지 최적화

Next.js의 `Image` 컴포넌트를 사용하면 자동으로 이미지 최적화가 됩니다.

```tsx
import Image from "next/image";

<Image
  src="/example.jpg"
  alt="예시 이미지"
  width={800}
  height={600}
  priority // 중요 이미지의 경우
/>;
```

## 2. 동적 라우팅

파일명에 `[slug]`를 사용하면 동적 라우팅이 가능합니다.

```
app/
  posts/
    [slug]/
      page.tsx
```

## 3. 메타데이터 관리

각 페이지에서 `metadata` 객체를 export하면 SEO에 도움이 됩니다.

```tsx
export const metadata = {
  title: "포스트 제목",
  description: "포스트 설명",
};
```

## 4. 서버 컴포넌트 활용

Next.js 13+에서는 기본적으로 서버 컴포넌트를 사용하므로, 클라이언트 컴포넌트가 필요한 경우에만 `'use client'`를 추가합니다.

## 마무리

이런 팁들이 Next.js 개발에 도움이 되길 바랍니다!
