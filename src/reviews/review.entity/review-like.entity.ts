import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('review_likes')
export class ReviewLike {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'review_id' })
  reviewId: number;

  @ManyToOne('User', 'reviewLikes', {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Review', 'likes', {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
