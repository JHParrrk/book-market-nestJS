import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 기본 서버 상태를 확인하는 엔드포인트입니다.
   * 브라우저에서 루트 URL 접속 시 간단한 환영 메시지를 보여줍니다.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * 서버 및 데이터베이스 연결 상태를 확인하는 헬스 체크 엔드포인트입니다.
   * 성공 시 200 OK와 함께 성공 메시지를, 실패 시 500 Internal Server Error를 반환합니다.
   */
  @Get('health')
  async healthCheck() {
    try {
      await this.appService.checkDatabaseConnection();
      return {
        status: 'ok',
        message: 'Server and database connection are healthy.',
      };
    } catch {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database connection failed.',
      });
    }
  }
}
