import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Module({
  imports: [
    // 1. User 엔터티에 대한 Repository를 주입할 수 있도록 설정
    TypeOrmModule.forFeature([User]),

    // 2. JWT 모듈 설정
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigModule을 가져와서 ConfigService를 사용할 수 있게 함
      useFactory: (configService: ConfigService) => ({
        // .env 파일의 ACCESS_SECRET_KEY를 JWT 시크릿 키로 사용
        secret: configService.get<string>('ACCESS_SECRET_KEY'),
        signOptions: {
          expiresIn: '1h', // 액세스 토큰 만료 시간: 1시간
        },
      }),
      inject: [ConfigService], // useFactory에 ConfigService 주입
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 다른 모듈(예: AuthModule)에서 UsersService를 사용할 경우를 대비해 export
})
export class UsersModule {}
