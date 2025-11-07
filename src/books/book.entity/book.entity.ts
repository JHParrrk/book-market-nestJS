import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from '@/categories/category.entity/category.entity';
import { BookDetail } from './book_detail.entity';
import { Cart } from '@/carts/cart.entity/cart.entity';
import { OrderDetail } from '@/orders/order.entity/order_detail.entity';
import { Review } from '@/reviews/review.entity/review.entity';
import { BookLike } from './book_like.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.books, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  author: string;

  @Column({ length: 255, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'date', nullable: true, name: 'published_date' })
  publishedDate?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0, name: 'average_rating' })
  averageRating: number;

  @Column({ type: 'int', default: 0, name: 'review_count' })
  reviewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToOne(() => BookDetail, (bookDetail) => bookDetail.book, {
    cascade: true,
  })
  bookDetail: BookDetail;

  @OneToMany(() => Cart, (cart) => cart.book)
  cartItems: Cart[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.book)
  orderDetails: OrderDetail[];

  @OneToMany(() => Review, (review) => review.book)
  reviews: Review[];

  @OneToMany(() => BookLike, (bookLike) => bookLike.book)
  likes: BookLike[];
}
