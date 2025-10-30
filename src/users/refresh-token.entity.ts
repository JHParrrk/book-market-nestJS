import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens') // 테이블 이름을 'refresh_tokens'로 명시
export class RefreshToken {
  @PrimaryGeneratedColumn() // 자동 증가 ID
  id: number;

  @Column({ name: 'user_id' }) // 사용자 ID 컬럼
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // User와 다대일 관계
  @JoinColumn({ name: 'user_id' }) // 외래 키 컬럼 이름 지정
  user: User;

  @Column({ type: 'text' }) // 리프레시 토큰 (해싱된 값 저장)
  token: string;

  @Column({ type: 'datetime', name: 'expires_at' }) // 만료 시간
  expires_at: Date;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' }) // 생성 시간
  created_at: Date;
}
