import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { User } from '@/users/user.entity/user.entity';
import { Book } from '@/books/book.entity/book.entity';
import { ReviewLike } from '@/reviews/review.entity/review_like.entity';

@Entity('reviews')
@Unique(['user', 'book'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 관계를 문자열 기반으로 수정
  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.reviews, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column()
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ReviewLike, (reviewLike) => reviewLike.review)
  likes: ReviewLike[];
}
