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
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST'), // DB_HOST 값을 동적으로 가져옴
          port: configService.get<number>('DB_PORT') || 3306,
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [
            User,
            RefreshToken /* Order, Cart, Review, Book, Category */,
          ],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
        };

        console.log('✅ TypeORM Configuration:', dbConfig); // 디버깅용 로그

        return dbConfig;
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    UsersModule,
    AuthModule,
    // BooksModule,
    // CategoriesModule,
    // OrdersModule,
    // CartsModule,
    // ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
