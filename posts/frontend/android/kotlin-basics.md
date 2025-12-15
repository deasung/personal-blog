---
title: Kotlin 기초
date: 2024-02-20
description: Android 개발을 위한 Kotlin 언어 기초를 알아봅니다.
category: frontend
subcategory: android
tags: [Android, Kotlin, 모바일개발]
---

# Kotlin 기초

Kotlin은 Android 공식 개발 언어로, 간결하고 안전한 코드를 작성할 수 있습니다.

## 변수 선언

```kotlin
// val: 불변 변수 (read-only)
val name: String = "Android"

// var: 가변 변수
var age: Int = 25

// 타입 추론
val message = "Hello Kotlin"
```

## 함수

```kotlin
fun greet(name: String): String {
    return "Hello, $name!"
}

// 단일 표현식 함수
fun add(a: Int, b: Int) = a + b
```

## 클래스

```kotlin
class User(val name: String, var age: Int) {
    fun introduce() {
        println("I'm $name, $age years old")
    }
}
```

## Null 안전성

```kotlin
// Nullable 타입
var nullable: String? = null

// Safe call operator
val length = nullable?.length

// Elvis operator
val result = nullable ?: "Default"
```

## 마무리

Kotlin은 현대적이고 안전한 Android 개발을 위한 훌륭한 선택입니다.
