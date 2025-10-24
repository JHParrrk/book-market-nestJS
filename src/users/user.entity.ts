import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('users') // 테이블 이름을 'users'로 명시
export class User {
  @PrimaryGeneratedColumn() // 자동 증가 ID
  id: number;

  @Column({ length: 255 }) // 이름 컬럼
  name: string;

  @Column({ unique: true, length: 255 }) // 고유 제약 조건 및 길이 제한
  email: string;

  @Column({ length: 255 }) // 비밀번호 컬럼
  password: string;

  @Column({ length: 255, nullable: true }) // 주소 컬럼 (NULL 허용)
  address?: string;

  @Column({ length: 20, nullable: true }) // 전화번호 컬럼 (NULL 허용)
  phone_number?: string;

  @Column({ length: 100, default: 'member' }) // 역할 컬럼 (기본값: 'member')
  role: string;

  @CreateDateColumn({ type: 'timestamp' }) // 생성 날짜 컬럼
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // 수정 날짜 컬럼
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true }) // 삭제 날짜 컬럼 (소프트 삭제)
  deleted_at?: Date;
}