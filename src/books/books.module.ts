import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // TypeORM 모듈을 가져옵니다.
import { JwtModule } from '@nestjs/jwt'; // JWT를 처리하기 위한 모듈을 가져옵니다.
import { ConfigModule, ConfigService } from '@nestjs/config'; // 환경 설정을 위한 모듈 및 서비스

import { Book } from './book.entity/book.entity';
import { BookLike } from './book.entity/book_like.entity';
import { BookDetail } from './book.entity/book_detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookLike, BookDetail]),
    // JWT 모듈 설정
    JwtModule.registerAsync({
      // 비동기 방식으로 JWT 모듈을 설정
      imports: [ConfigModule], // 환경 변수(ConfigService)를 사용하기 위해 ConfigModule을 가져옵니다.
      useFactory: (configService: ConfigService) => ({
        // 환경 변수에서 JWT 시크릿 키를 가져옵니다.
        secret: configService.get<string>('ACCESS_SECRET_KEY'),
        signOptions: {
          expiresIn: '1h', // JWT 액세스 토큰의 만료 시간은 1시간으로 설정
        },
      }),
      inject: [ConfigService], // ConfigService를 useFactory에 주입하여 환경 변수를 읽을 수 있도록 설정
    }),
  ],

  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
