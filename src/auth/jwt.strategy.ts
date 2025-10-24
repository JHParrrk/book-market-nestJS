import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // 사용자 정보를 DB에서 한번 더 확인
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_SECRET_KEY'),
    });
  }

  // 토큰이 유효할 때 실행되는 메서드
  async validate(payload: any) {
    // 필요하다면 여기서 DB를 조회해 사용자가 실제로 존재하는지, 활성화 상태인지 등을 확인할 수 있습니다.
    // const user = await this.usersService.findOneById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    // }
    
    // 이 메서드의 반환값은 @Req() 데코레이터를 사용했을 때 req.user에 담깁니다.
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}