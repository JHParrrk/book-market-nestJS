// app.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  // 애플리케이션 시작 시 DB 연결 상태를 확인합니다.
  async onModuleInit() {
    await this.checkDatabaseConnection();
  }

  // 헬스 체크를 위한 DB 연결 확인 메서드
  async checkDatabaseConnection(): Promise<void> {
    try {
      // 간단한 쿼리를 실행하여 연결 상태를 확인합니다.
      await this.dataSource.query('SELECT 1');
      console.log('✅ Database connection is healthy');
    } catch (error) {
      console.error(
        '❌ Database connection failed:',
        error instanceof Error ? error.message : String(error),
      );
      // 에러를 다시 던져서 호출한 쪽에서 상태를 알 수 있게 합니다.
      throw error;
    }
  }

  // 기본 "Hello World" 메시지를 반환하는 메서드
  getHello(): string {
    return 'Welcome to the Book Market API!';
  }
}
