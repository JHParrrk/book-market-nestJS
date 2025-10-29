# 리프레시 토큰 가이드 (Refresh Token Guide)

## 개요 (Overview)

이 프로젝트에 리프레시 토큰 저장, 갱신, 사용 로직이 구현되었습니다.

## 구현 내용 (Implementation Details)

### 1. 데이터베이스 변경 (Database Changes)

**User Entity** (`src/users/user.entity.ts`)
- `refresh_token` 컬럼 추가 (타입: text, nullable)
- 리프레시 토큰은 bcrypt로 해싱되어 저장됩니다

### 2. 토큰 생성 및 저장 (Token Generation & Storage)

**로그인 API** (`POST /users/login`)
- 기존: `accessToken`만 반환
- 변경: `accessToken`과 `refreshToken` 모두 반환
- 액세스 토큰: 1시간 만료
- 리프레시 토큰: 7일 만료
- 리프레시 토큰은 해싱되어 데이터베이스에 저장

**예시 응답:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. 토큰 갱신 (Token Refresh)

**리프레시 API** (`POST /users/refresh`)
- 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰 발급
- 토큰 로테이션(Token Rotation) 구현: 매 갱신마다 새로운 리프레시 토큰 발급

**요청 예시:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답 예시:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. 로그아웃 (Logout)

**로그아웃 API** (`POST /users/logout`)
- JWT 인증 필요
- 데이터베이스에 저장된 리프레시 토큰을 무효화
- 로그아웃 후 해당 리프레시 토큰은 더 이상 사용할 수 없음

**요청 헤더:**
```
Authorization: Bearer <accessToken>
```

## 환경 변수 설정 (Environment Variables)

`.env` 파일에 다음 환경 변수가 필요합니다:

```
ACCESS_SECRET_KEY=your_access_secret_key
REFRESH_SECRET_KEY=your_refresh_secret_key
```

**참고:** `REFRESH_SECRET_KEY`는 `ACCESS_SECRET_KEY`와 반드시 다른 값을 사용해야 합니다.

## 보안 기능 (Security Features)

1. **토큰 해싱**: 리프레시 토큰은 bcrypt로 해싱되어 데이터베이스에 저장
2. **토큰 로테이션**: 리프레시 시 새로운 리프레시 토큰 발급 (이전 토큰 무효화)
3. **만료 시간**: 
   - 액세스 토큰: 1시간 (짧은 수명으로 보안 강화)
   - 리프레시 토큰: 7일
4. **로그아웃 처리**: 데이터베이스에서 리프레시 토큰 제거

## 사용 흐름 (Usage Flow)

```
1. 로그인
   POST /users/login
   → accessToken, refreshToken 획득

2. API 요청
   Authorization: Bearer <accessToken>
   
3. 액세스 토큰 만료 시
   POST /users/refresh
   body: { refreshToken }
   → 새로운 accessToken, refreshToken 획득

4. 로그아웃
   POST /users/logout
   Authorization: Bearer <accessToken>
   → 리프레시 토큰 무효화
```

## API 엔드포인트 요약 (API Endpoints Summary)

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|----------|------|
| POST | /users/login | ❌ | 로그인 (액세스 + 리프레시 토큰 발급) |
| POST | /users/refresh | ❌ | 토큰 갱신 |
| POST | /users/logout | ✅ | 로그아웃 (리프레시 토큰 무효화) |

## 데이터베이스 마이그레이션 (Database Migration)

`refresh_token` 컬럼을 기존 데이터베이스에 추가해야 합니다:

```sql
ALTER TABLE users ADD COLUMN refresh_token TEXT NULL;
```

**참고:** TypeORM을 사용하는 경우, 엔터티 변경 후 자동으로 동기화되거나 마이그레이션을 실행해야 합니다.
