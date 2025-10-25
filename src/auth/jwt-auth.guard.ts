// JwtAuthGuard는 Passport의 'jwt' 전략을 사용하는 NestJS의 인증 가드입니다.
import { Injectable } from '@nestjs/common'; // [1] NestJS에서 제공하는 Injectable 데코레이터를 가져옵니다.
import { AuthGuard } from '@nestjs/passport'; // [2] Passport 전략을 확장하기 위한 AuthGuard를 가져옵니다.

@Injectable() // [3] 이 클래스를 NestJS의 의존성 주입 시스템에서 관리되도록 설정합니다.
export class JwtAuthGuard extends AuthGuard('jwt') {}
// [4] AuthGuard를 확장하여 'jwt' 전략을 사용하는 커스텀 인증 가드를 정의합니다.
//    - 'jwt' : JwtStrategy에서 정의한 전략 이름입니다.
//    - 이 가드는 보호된 라우트에 접근할 때 JWT 토큰의 유효성을 검사하는 역할을 합니다.
//    - 인증에 성공하면 요청 객체(req)에 사용자 정보가 추가되어 이후 핸들러에서 사용할 수 있습니다.
//    - 인증에 실패하면 401 Unauthorized 예외가 발생합니다.
