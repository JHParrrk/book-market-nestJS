// JwtStrategy는 JWT 인증을 처리하기 위한 Passport 전략입니다.
import { Injectable, UnauthorizedException } from '@nestjs/common'; // [1] NestJS의 Injectable 데코레이터와 예외 처리 클래스
import { PassportStrategy } from '@nestjs/passport'; // [2] Passport 전략을 확장하기 위한 클래스
import { ExtractJwt, Strategy } from 'passport-jwt'; // [3] JWT 처리 및 추출 유틸리티
import { ConfigService } from '@nestjs/config'; // [4] 환경 변수 관리를 위한 ConfigService
import { UsersService } from '../users/users.service'; // [5] 사용자 정보를 처리하기 위한 UsersService
import { User } from '../users/user.entity'; // [6] 사용자 엔터티를 가져옵니다.

@Injectable() // [7] JwtStrategy를 NestJS의 의존성 주입 컨테이너에서 관리될 수 있도록 설정합니다.
export class JwtStrategy extends PassportStrategy(Strategy) {
  // [8] Passport의 JWT 전략을 확장합니다.
  constructor(
    private readonly configService: ConfigService, // [9] ConfigService를 주입받아 환경 변수를 읽습니다.
    private readonly usersService: UsersService, // [10] UsersService를 주입받아 사용자 정보를 처리합니다.
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // [11] HTTP 요청 헤더에서 Bearer 토큰을 추출합니다.
      ignoreExpiration: false, // [12] 만료된 토큰은 허용하지 않습니다.
      secretOrKey: configService.getOrThrow<string>('ACCESS_SECRET_KEY'), // [13] JWT 서명 검증에 사용할 비밀 키를 환경 변수에서 가져옵니다.
    });
  }

  /**
   * JWT의 서명과 만료일이 유효할 때 실행되는 메서드입니다.
   * @param payload - 토큰에 담겨있던 정보 (e.g., { sub: 1, email: 'test@test.com' })
   * @returns - 여기서 반환된 값은 req.user에 담깁니다.
   */
  async validate(payload: {
    sub: number; // [14] 사용자 ID (JWT의 `sub` 클레임)
    email: string; // [15] 사용자 이메일
    role: string; // [16] 사용자 역할 (예: 'admin', 'user')
  }): Promise<User> {
    // 1. 토큰의 sub(사용자 ID)를 이용해 DB에서 사용자 정보를 조회합니다.
    const user = await this.usersService.findOneById(payload.sub); // [17] `sub` 값으로 사용자 정보를 조회합니다.

    // 2. 사용자가 존재하지 않는 경우, 예외를 던져 인증을 거부합니다.
    if (!user) {
      // [18] 사용자가 존재하지 않으면 UnauthorizedException 예외를 발생시킵니다.
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    // 3. DB에서 조회한 최신 사용자 정보를 반환합니다.
    //    (비밀번호와 같은 민감 정보는 서비스나 레포지토리에서 제외하고 반환하는 것이 좋습니다)
    return user; // [19] 사용자 정보를 반환하며, 이 값은 req.user에 저장됩니다.
  }
}
