---
title: AWS 기초 가이드
date: 2024-01-25
description: AWS 클라우드 서비스의 기초를 알아봅니다.
category: infrastructure
subcategory: aws
tags: [AWS, 클라우드, 인프라]
---

# AWS 기초 가이드

Amazon Web Services(AWS)는 세계적으로 널리 사용되는 클라우드 컴퓨팅 플랫폼입니다.

## 주요 서비스

### EC2 (Elastic Compute Cloud)
가상 서버를 제공하는 서비스입니다.

```bash
# EC2 인스턴스 생성 예시
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name my-key-pair
```

### S3 (Simple Storage Service)
객체 스토리지 서비스로, 파일을 저장하고 관리할 수 있습니다.

### RDS (Relational Database Service)
관계형 데이터베이스를 쉽게 관리할 수 있는 서비스입니다.

## 시작하기

1. AWS 계정 생성
2. IAM 사용자 설정
3. 필요한 서비스 선택 및 구성

## 마무리

AWS는 다양한 서비스를 제공하여 인프라 구축을 쉽게 만들어줍니다.

