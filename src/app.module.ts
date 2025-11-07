import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity/user.entity';
import { RefreshToken } from './users/user.entity/refresh-token.entity';
import { AuthModule } from './auth/auth.module';
// import { Order } from './orders/order.entity/order.entity';
// import { Cart } from './carts/cart.entity/cart.entity';
// import { Review } from './reviews/review.entity/review.entity';
// import { Book } from './books/book.entity/book.entity';
// import { Category } from './categories/category.entity/category.entity';

// import { BooksModule } from './books/books.module';
// import { CategoriesModule } from './categories/categories.module';
// import { OrdersModule } from './orders/orders.module';
// import { CartsModule } from './carts/carts.module';
// import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    // 환경 변수를 설정하는 ConfigModule을 글로벌로 사용
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM 설정을 동적으로 구성 (비동기 방식)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 데이터베이스 연결 설정
        const dbConfig = {
          type: 'mysql' as const, // MySQL 데이터베이스 사용
          host: configService.get<string>('DB_HOST'), // 환경 변수에서 호스트 읽기
          port: configService.get<number>('DB_PORT') || 3306, // 포트 기본값: 3306
          username: configService.get<string>('DB_USERNAME'), // 사용자 이름
          password: configService.get<string>('DB_PASSWORD'), // 비밀번호
          database: configService.get<string>('DB_DATABASE'), // 데이터베이스 이름
          entities: [
            User,
            RefreshToken /* Order, Cart, Review, Book, Category */,
          ],
          synchronize: configService.get<string>('NODE_ENV') !== 'production', // 개발 환경에서만 자동 마이그레이션 활성화
        };

        console.log('✅ TypeORM Configuration:', dbConfig); // 설정 출력 (디버깅용)
        return dbConfig;
      },
      inject: [ConfigService],
    }),

    // 정적 파일 호스팅 설정
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // public 폴더를 정적 파일로 서비스
    }),

    // 애플리케이션 모듈 설정
    UsersModule,
    AuthModule,
    // BooksModule,
    // CategoriesModule,
    // OrdersModule,
    // CartsModule,
    // ReviewsModule,
  ],

  // 애플리케이션 컨트롤러
  controllers: [AppController],

  // 애플리케이션 서비스 계층
  providers: [AppService],
})
export class AppModule {}
