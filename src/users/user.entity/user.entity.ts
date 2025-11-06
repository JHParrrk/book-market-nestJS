import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  // OneToMany,
  // OneToOne,
} from 'typeorm';

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

  // // 👇 모든 관계 정의를 문자열 기반으로 변경하고, 타입을 any로 설정합니다.

  // @OneToMany('Order', 'user')
  // orders: any[]; // 또는 Promise<any[]>

  // @OneToOne('RefreshToken', 'user')
  // refreshToken: any; // 또는 Promise<any>

  // @OneToMany('Cart', 'user')
  // cartItems: any[];

  // @OneToMany('Review', 'user')
  // reviews: any[];

  // @OneToMany('BookLike', 'user')
  // bookLikes: any[];

  // @OneToMany('ReviewLike', 'user')
  // reviewLikes: any[];
}
