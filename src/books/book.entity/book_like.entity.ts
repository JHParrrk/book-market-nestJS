import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Book } from '@/books/book.entity/book.entity';
import { User } from '@/users/user.entity/user.entity';

@Entity('book_likes')
export class BookLike {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'book_id' })
  bookId: number;

  @ManyToOne(() => User, (user) => user.bookLikes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.likes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
