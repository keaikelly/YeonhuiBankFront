# 🏦 YeonhuiBank – 인터넷뱅킹 & 예약이체 시스템

스프링 부트와 React 기반으로 구현한 **모의 인터넷뱅킹 서비스**입니다.  
계좌 관리, 즉시 이체, 예약이체 생성/수정/재시도, 실행 로그 조회 등 실제 금융 흐름을 반영한 기능들을 포함하고 있습니다.

---

## 🎥 시연 영상

👉 https://youtu.be/vb5vZrfHvyU

---

## 📂 Github Repository

### 🔹 Backend

https://github.com/keaikelly/YeonhuiBank

### 🔹 Frontend

https://github.com/keaikelly/YeonhuiBankFront

---

## ✨ 주요 기능

### 1) 계좌 관리

- 계좌 생성 / 조회
- 입금 / 출금 / 계좌 간 즉시 이체
- 거래내역 확인

---

### 2) 예약이체 (Scheduled Transfer)

스케줄 기반 자동 이체 기능 구현:

- 예약이체 생성, 수정, 취소
- 반복 주기: **ONCE / DAILY / WEEKLY / MONTHLY / CUSTOM(RRULE)**
- nextRunAt 기반 실행 스케줄링
- RRULE 기반 커스텀 반복 실행
- **실행 실패 시 자동 재시도 (최대 3회)**
- 반복 실패 시 더 이상 실행되지 않음

---

### 3) 실행 로그(ScheduledTransferRun)

예약이체 실행마다 로그가 생성되며 다음을 기록함:

---

### 4) 자동 재시도 로직

예약이체 실행 실패 시 다음과 같은 로직으로 처리됨:

1. retryNo = 0에서 실패 발생
2. nextRetryAt = now + 10분
3. retryNo < 3 → 재시도
4. retryNo == maxRetries → 예약이체 실행 종료

---

### 5) 스케줄러 동작 (@Scheduled)

매 분 실행되며 다음 수행:

- now >= nextRunAt 인 예약 이체 조회
- executeSchedule() 호출
- 성공/실패 기록 후 nextRunAt 갱신

---

## 🧱 기술 스택

### Backend

- Java 17
- Spring Boot 3
- Spring Data JPA
- Spring Scheduler
- MySQL

### Frontend

- React
- React Router
- Axios

---

## 📁 프로젝트 구조

### Backend
