---
title: React Native 시작하기
date: 2024-02-15
description: React Native로 모바일 앱을 개발하는 방법을 알아봅니다.
category: frontend
subcategory: react-native
tags: [React Native, 모바일, 앱개발]
---

# React Native 시작하기

React Native는 JavaScript로 네이티브 모바일 앱을 만들 수 있는 프레임워크입니다.

## 설치

```bash
npx react-native init MyApp
cd MyApp
```

## 기본 컴포넌트

```jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hello React Native!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

## 실행

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## 마무리

React Native로 하나의 코드베이스로 iOS와 Android 앱을 모두 만들 수 있습니다.
