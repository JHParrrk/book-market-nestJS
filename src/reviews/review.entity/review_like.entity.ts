import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '@/users/user.entity/user.entity';
import { Review } from '@/reviews/review.entity/review.entity';

@Entity('review_likes')
export class ReviewLike {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'review_id' })
  reviewId: number;

  @ManyToOne(() => User, (user) => user.reviewLikes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Review, (review) => review.likes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
