import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3 클라이언트 초기화
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export async function POST(request: NextRequest) {
  try {
    // 인증 확인 (admin token 체크)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "파일이 없습니다." },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "이미지 파일만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "파일 크기는 10MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `images/${timestamp}-${randomString}.${fileExtension}`;

    // 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // S3에 업로드
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // 또는 "private"로 설정하고 CloudFront를 사용할 수도 있습니다
    });

    await s3Client.send(command);

    // 업로드된 이미지 URL 생성
    // CloudFront URL이 설정되어 있으면 CloudFront 사용, 없으면 S3 직접 URL 사용
    const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL;
    const imageUrl = cloudFrontUrl
      ? `${cloudFrontUrl}/${fileName}`
      : `https://${BUCKET_NAME}.s3.${
          process.env.AWS_REGION || "ap-northeast-2"
        }.amazonaws.com/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        fileName,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
