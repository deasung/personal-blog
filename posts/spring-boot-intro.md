---
title: 스프링부트 시작하기
date: 2024-02-05
description: 스프링부트 프레임워크를 사용하여 백엔드 애플리케이션을 개발하는 방법을 알아봅니다.
category: backend
subcategory: spring-boot
tags: [스프링부트, Java, 백엔드]
---

# 스프링부트 시작하기

Spring Boot는 Java 기반의 웹 애플리케이션 개발을 쉽게 만들어주는 프레임워크입니다.

## 프로젝트 생성

Spring Initializr를 사용하여 프로젝트를 생성할 수 있습니다.

```bash
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.2.0 \
  -o myproject.zip
```

## 기본 구조

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## REST API 컨트롤러

```java
@RestController
@RequestMapping("/api")
public class UserController {
    
    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.findAll();
    }
    
    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
```

## 의존성 주입

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
}
```

## 마무리

Spring Boot는 빠르고 효율적인 백엔드 개발을 가능하게 해줍니다.

