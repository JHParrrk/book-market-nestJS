// app.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('SELECT 1');
      console.log('✅ Database connection is healthy');
    } catch (error) {
      console.error(
        '❌ Database connection failed:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
