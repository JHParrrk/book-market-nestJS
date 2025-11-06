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

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 모든 관계를 문자열 기반으로 수정합니다.
  @ManyToOne('Category', 'books', {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: any;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  author: string;

  // ... (다른 컬럼들은 변경 없음)
  @Column({ length: 255, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'date', nullable: true, name: 'published_date' })
  publishedDate?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true, name: 'average_rating' })
  averageRating?: number;

  @Column({ type: 'int', nullable: true, name: 'review_count' })
  reviewCount?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // 👇 나머지 관계들도 모두 문자열 기반으로 수정합니다.
  @OneToOne('BookDetail', 'book')
  bookDetail: any;

  @OneToMany('Cart', 'book')
  cartItems: any[];

  @OneToMany('OrderDetail', 'book')
  orderDetails: any[];

  @OneToMany('Review', 'book')
  reviews: any[];

  @OneToMany('BookLike', 'book')
  likes: any[];
}
