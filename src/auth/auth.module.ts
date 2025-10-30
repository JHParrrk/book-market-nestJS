import { Module } from '@nestjs/common'; // [1] NestJS의 Module 데코레이터를 가져옵니다.
import { PassportModule } from '@nestjs/passport'; // [2] Passport를 사용한 인증 관련 유틸리티를 제공합니다.
import { JwtModule } from '@nestjs/jwt'; // [3] JWT 생성 및 검증을 위한 모듈을 가져옵니다.
import { ConfigModule, ConfigService } from '@nestjs/config'; // [4] 환경 변수 관리를 위한 모듈과 서비스
import { UsersModule } from '../users/users.module'; // [5] 사용자 정보를 처리하기 위해 UsersModule을 가져옵니다.
import { JwtStrategy } from './jwt.strategy'; // [6] JWT 인증 로직을 정의하는 JwtStrategy를 가져옵니다.

@Module({
  imports: [
    UsersModule, // [7] UsersModule을 가져와 사용자 정보와 관련된 로직을 주입받을 수 있도록 설정합니다.
    PassportModule, // [8] Passport 모듈을 가져와 인증 관련 유틸리티를 제공합니다.
    JwtModule.registerAsync({
      // [9] JwtModule을 비동기 방식으로 설정합니다.
      imports: [ConfigModule], // [10] ConfigModule을 가져와 환경 변수를 사용할 수 있도록 설정합니다.
      useFactory: (configService: ConfigService) => ({
        // [11] 환경 변수에서 JWT 설정 정보를 동적으로 가져옵니다.
        secret: configService.get<string>('ACCESS_SECRET_KEY'), // [12] JWT 서명을 위한 비밀 키를 환경 변수에서 가져옵니다.
        signOptions: { expiresIn: '1h' }, // [13] JWT 액세스 토큰의 만료 시간을 1시간으로 설정합니다.
      }),
      inject: [ConfigService], // [14] ConfigService를 주입하여 환경 변수를 사용할 수 있도록 설정합니다.
    }),
  ],
  providers: [JwtStrategy], // [15] JwtStrategy를 인증 전략으로 등록합니다.
  exports: [PassportModule, JwtModule], // [16] PassportModule과 JwtModule을 내보내 다른 모듈에서 사용할 수 있도록 설정합니다.
})
export class AuthModule {} // [17] AuthModule 클래스를 정의합니다.
//    - 이 모듈은 JWT 기반 인증을 처리하기 위한 설정과 전략을 포함합니다.
