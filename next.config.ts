import type { NextConfig } from "next";

function getHostnameFromUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const cloudfrontHost = getHostnameFromUrl(process.env.AWS_CLOUDFRONT_URL);
const remotePatterns = [
  // CloudFront (대표 썸네일/에디터 이미지)
  { protocol: "https" as const, hostname: "*.cloudfront.net" },
  // AWS S3 public URL (혹시 CloudFront 미사용 시)
  { protocol: "https" as const, hostname: "*.amazonaws.com" },
  // 환경 변수로 지정한 CloudFront URL이 있다면 정확히 허용
  ...(cloudfrontHost
    ? [{ protocol: "https" as const, hostname: cloudfrontHost }]
    : []),
];

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns,
  },
  // 압축 활성화
  compress: true,
  // 실험적 기능
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
