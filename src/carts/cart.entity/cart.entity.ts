import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Book } from '@/books/book.entity/book.entity';
import { User } from '@/users/user.entity/user.entity';

@Entity('carts')
@Unique(['user', 'book'])
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.cartItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.cartItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column()
  quantity: number;
}
