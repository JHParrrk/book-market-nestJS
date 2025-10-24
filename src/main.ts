import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'; // 수정된 import
import morgan from 'morgan'; // 수정된 import
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. 전역 예외 필터 적용
  app.useGlobalFilters(new AllExceptionsFilter());

  // 2. 전역 유효성 검사 파이프 적용
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 들어오면 에러 발생
      transform: true, // 요청 파라미터를 DTO에 정의된 타입으로 자동 변환
    }),
  );

  // 3. Express 미들웨어 적용
  app.use(cookieParser());
  app.use(morgan('dev'));

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();
