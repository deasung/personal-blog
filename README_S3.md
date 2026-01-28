# AWS S3 이미지 업로드 설정 가이드

## 환경 변수 설정

프로젝트 루트에 `.env` 파일에 다음 AWS S3 관련 환경 변수를 추가하세요:

```env
# AWS S3 설정
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name

# CloudFront URL (설정하면 에디터에 CloudFront URL이 삽입됩니다)
# 예: AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
AWS_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

**참고**: `AWS_CLOUDFRONT_URL`을 설정하면 에디터에 삽입되는 이미지 URL이 CloudFront URL로 생성됩니다. 설정하지 않으면 S3 직접 URL이 사용됩니다.

## AWS S3 버킷 설정

1. **버킷 생성**

   - AWS 콘솔에서 S3 버킷을 생성하세요
   - 리전은 `ap-northeast-2` (서울) 또는 원하는 리전을 선택하세요

2. **버킷 정책 설정**

   - 버킷의 권한(Permissions) 탭으로 이동
   - 버킷 정책(Bucket Policy)에 다음을 추가:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

   - 또는 CORS 설정을 추가하여 특정 도메인에서만 접근 가능하도록 설정할 수 있습니다

3. **CORS 설정 (선택사항)**
   - 버킷의 권한(Permissions) 탭에서 CORS 설정 추가:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
       "ExposeHeaders": []
     }
   ]
   ```

## IAM 사용자 권한 설정

S3 업로드를 위한 IAM 사용자에게 다음 권한이 필요합니다.

### 방법 1: IAM 정책 직접 생성 및 연결 (권장)

1. **AWS 콘솔에서 IAM으로 이동**

   - IAM > 사용자 > `dskim-dev` 선택

2. **권한 추가**

   - "권한 추가" 버튼 클릭
   - "정책 직접 연결" 선택

3. **정책 생성**
   - "정책 생성" 클릭
   - JSON 탭에서 다음 정책 입력:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ImageUpload",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::comecome2/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::comecome2"
    }
  ]
}
```

4. **정책 이름 지정**

   - 이름: `S3ImageUploadPolicy` (또는 원하는 이름)
   - 설명: "블로그 이미지 업로드를 위한 S3 권한"

5. **정책 생성 후 사용자에 연결**
   - 생성한 정책을 `dskim-dev` 사용자에 연결

### 방법 2: 기존 정책 수정

이미 정책이 있다면, 다음 권한이 포함되어 있는지 확인:

- `s3:PutObject` - 필수
- `s3:PutObjectAcl` - public-read 설정 시 필요
- `s3:GetObject` - 이미지 조회 시 필요 (선택사항)
- `s3:ListBucket` - 버킷 목록 조회 (선택사항)

### 버킷 이름 확인

현재 버킷 이름: `comecome2`

- 정책의 `Resource`에 `arn:aws:s3:::comecome2/*` 형식으로 정확히 입력해야 합니다.

## 사용 방법

1. 환경 변수를 `.env` 파일에 설정
2. Vite 개발 서버 재시작
3. `/admin/posts` 페이지에서 포스트 작성/수정
4. 에디터 툴바의 "이미지" 버튼 클릭
5. 이미지 파일 선택 (최대 10MB)
6. 자동으로 S3에 업로드되고 에디터에 삽입됩니다

## 보안 고려사항

- **프로덕션 환경에서는**:
  - CloudFront를 사용하여 이미지 CDN 제공
  - 버킷 정책을 더 엄격하게 설정 (특정 IP나 도메인만 허용)
  - IAM 사용자 권한을 최소 권한 원칙에 따라 설정
  - 이미지 리사이징 및 최적화 기능 추가 고려

## 파일 저장 경로

이미지는 다음 경로에 저장됩니다:

- `images/{timestamp}-{randomString}.{extension}`
- 예: `images/1705123456789-abc123def456.jpg`

## 에러 처리

- 인증 토큰이 없으면 업로드 실패
- 이미지 파일이 아니면 업로드 실패
- 파일 크기가 10MB를 초과하면 업로드 실패
- S3 연결 오류 시 에러 메시지 표시
