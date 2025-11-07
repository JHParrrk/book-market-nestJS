import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  // OneToOne,
} from 'typeorm';
import { RefreshToken } from '@/users/user.entity/refresh-token.entity';
import { Order } from '@/orders/order.entity/order.entity';
import { Cart } from '@/carts/cart.entity/cart.entity';
import { Review } from '@/reviews/review.entity/review.entity';
import { BookLike } from '@/books/book.entity/book_like.entity';
import { ReviewLike } from '@/reviews/review.entity/review_like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @Column({ default: 'member' })
  role: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true, // User 저장/삭제 시 RefreshToken도 연동
  })
  refreshToken: RefreshToken;

  @OneToMany(() => Cart, (cart) => cart.user)
  cartItems: Cart[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => BookLike, (bookLike) => bookLike.user)
  bookLikes: BookLike[];

  @OneToMany(() => ReviewLike, (reviewLike) => reviewLike.user)
  reviewLikes: ReviewLike[];
}
