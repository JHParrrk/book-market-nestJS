import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity/user.entity';
import { RefreshToken } from './user.entity/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_SECRET_KEY'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  // providers 배열에서 REQUEST 관련 코드를 완전히 삭제합니다.
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
