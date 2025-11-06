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
// import { User } from '@/users/user.entity/user.entity'; // 🚨 Import 제거
// import { Book } from '@/books/book.entity/book.entity'; // 🚨 Import 제거
// import { ReviewLike } from './review-like.entity'; // 🚨 Import 제거

@Entity('reviews')
@Unique(['user', 'book'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 관계를 문자열 기반으로 수정
  @ManyToOne('User', 'reviews', {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Book', 'reviews', {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: any;

  // ... (컬럼 변경 없음)
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column()
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('ReviewLike', 'review')
  likes: any[];
}
