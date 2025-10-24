import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module'; // UsersService를 사용하기 위해 import
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule, // UsersService를 주입하기 위해
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_SECRET_KEY'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy], // JwtStrategy를 provider로 등록
  exports: [PassportModule],
})
export class AuthModule {}