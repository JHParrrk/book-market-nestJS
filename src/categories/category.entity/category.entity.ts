import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Book } from '@/books/book.entity/book.entity'; // Book 엔티티 import

@Entity('categories') // 'categories' 테이블과 매핑 (카테고리 데이터를 저장)
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' }) // 상위 카테고리를 가리키는 외래 키
  parentCategory?: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  children?: Category[];

  @Column({ length: 100, unique: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Books와 연결된 다대일 관계: 한 카테고리에 여러 책
  @OneToMany(() => Book, (book) => book.category)
  books?: Book[];
}
