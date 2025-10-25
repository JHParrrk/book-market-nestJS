import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity'; // User 엔터티 타입 import

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_SECRET_KEY'),
    });
  }

  /**
   * JWT의 서명과 만료일이 유효할 때 실행되는 메서드입니다.
   * @param payload - 토큰에 담겨있던 정보 (e.g., { sub: 1, email: 'test@test.com' })
   * @returns - 여기서 반환된 값은 req.user에 담깁니다.
   */
  async validate(payload: {
    sub: number;
    email: string;
    role: string;
  }): Promise<User> {
    // 1. 토큰의 sub(사용자 ID)를 이용해 DB에서 사용자 정보를 조회합니다.
    const user = await this.usersService.findOneById(payload.sub);

    // 2. 사용자가 존재하지 않는 경우, 예외를 던져 인증을 거부합니다.
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    // 3. DB에서 조회한 최신 사용자 정보를 반환합니다.
    //    (비밀번호와 같은 민감 정보는 서비스나 레포지토리에서 제외하고 반환하는 것이 좋습니다)
    return user;
  }
}
