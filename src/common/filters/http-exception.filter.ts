// NestJS의 전역 예외 필터로, 애플리케이션에서 발생하는 모든 예외를 처리합니다.
import {
  ExceptionFilter, // 예외 필터의 기본 인터페이스
  Catch, // 특정 예외를 처리하는 필터로 지정하기 위한 데코레이터
  ArgumentsHost, // 예외가 발생한 컨텍스트(host)에 대한 정보를 제공
  HttpException, // HTTP 관련 예외를 처리하기 위한 클래스
  HttpStatus, // HTTP 상태 코드를 제공하는 유틸리티
} from '@nestjs/common';
import { Request, Response } from 'express'; // Express의 요청과 응답 객체 타입을 가져옵니다.

@Catch() // 모든 예외를 처리하도록 지정하는 데코레이터
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // [1] 예외 처리 로직을 정의하는 메서드
    const ctx = host.switchToHttp(); // [2] HTTP 요청/응답 컨텍스트를 가져옵니다.
    const response = ctx.getResponse<Response>(); // [3] Express 응답 객체를 가져옵니다.
    const request = ctx.getRequest<Request>(); // [4] Express 요청 객체를 가져옵니다.

    const status =
      exception instanceof HttpException // [5] 예외가 HttpException인지 확인
        ? exception.getStatus() // [6] HttpException에서 상태 코드를 가져옵니다.
        : HttpStatus.INTERNAL_SERVER_ERROR; // [7] HttpException이 아니면 500 상태 코드로 설정

    const message =
      exception instanceof HttpException // [8] 예외가 HttpException인지 확인
        ? exception.getResponse() // [9] HttpException에서 응답 메시지를 가져옵니다.
        : 'Internal server error'; // [10] HttpException이 아니면 기본 메시지 설정

    // [11] JSON 형식으로 에러 응답을 보냅니다.
    response.status(status).json({
      statusCode: status, // [12] HTTP 상태 코드
      timestamp: new Date().toISOString(), // [13] 예외가 발생한 시각
      path: request.url, // [14] 요청된 경로
      message, // [15] 예외 메시지
    });
  }
}
