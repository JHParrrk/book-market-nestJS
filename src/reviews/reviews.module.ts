import { Module } from '@nestjs/common';
import { ReviewController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
