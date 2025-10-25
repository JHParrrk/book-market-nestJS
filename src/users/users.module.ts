// NestJS 모듈로, 사용자와 관련된 로직을 처리하기 위한 설정을 포함합니다.
import { Module } from '@nestjs/common'; // NestJS의 Module 데코레이터를 가져옵니다.
import { TypeOrmModule } from '@nestjs/typeorm'; // TypeORM 모듈을 가져옵니다.
import { JwtModule } from '@nestjs/jwt'; // JWT를 처리하기 위한 모듈을 가져옵니다.
import { ConfigModule, ConfigService } from '@nestjs/config'; // 환경 설정을 위한 모듈 및 서비스

import { UsersController } from './users.controller'; // 사용자 관련 컨트롤러
import { UsersService } from './users.service'; // 사용자 관련 로직을 처리하는 서비스
import { User } from './user.entity'; // 사용자 데이터베이스 테이블을 나타내는 엔터티

@Module({
  imports: [
    // 1. User 엔터티에 대한 Repository를 주입할 수 있도록 설정
    TypeOrmModule.forFeature([User]), // [1] User 엔터티와 매핑된 Repository를 주입

    // 2. JWT 모듈 설정
    JwtModule.registerAsync({
      // [2] 비동기 방식으로 JWT 모듈을 설정
      imports: [ConfigModule], // [3] 환경 변수(ConfigService)를 사용하기 위해 ConfigModule을 가져옵니다.
      useFactory: (configService: ConfigService) => ({
        // [4] 환경 변수에서 JWT 시크릿 키를 가져옵니다.
        secret: configService.get<string>('ACCESS_SECRET_KEY'),
        signOptions: {
          expiresIn: '1h', // [5] JWT 액세스 토큰의 만료 시간은 1시간으로 설정
        },
      }),
      inject: [ConfigService], // [6] ConfigService를 useFactory에 주입하여 환경 변수를 읽을 수 있도록 설정
    }),
  ],
  controllers: [UsersController], // [7] UsersController를 이 모듈에 등록
  providers: [UsersService], // [8] UsersService를 이 모듈에 등록
  exports: [UsersService], // [9] UsersService를 다른 모듈에서도 사용할 수 있도록 export
})
export class UsersModule {} // [10] UsersModule 클래스를 정의
