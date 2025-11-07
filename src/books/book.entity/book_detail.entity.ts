import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Book } from '@/books/book.entity/book.entity';

@Entity('book_details')
export class BookDetail {
  @PrimaryColumn({ name: 'book_id' })
  bookId: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true, name: 'table_of_contents' })
  tableOfContents?: string;

  @Column({ length: 50, nullable: true })
  form?: string;

  @Column({ length: 13, unique: true })
  isbn: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Book, (book) => book.bookDetail, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
