import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/users/user.entity/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * RefreshToken은 특정 User에 종속됩니다.
   * onDelete: 'CASCADE' - 연결된 User가 삭제될 경우, 이 RefreshToken도 DB에서 삭제됩니다.
   */
  @ManyToOne(() => User, (user) => user.refreshToken, {
    onDelete: 'CASCADE', // User 삭제 시 자동 삭제
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 'token' 필드를 'hashedToken'으로 변경하여 의도를 명확화
  @Column({ type: 'text', name: 'hashed_token' })
  hashedToken: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  // 토큰이 명시적으로 무효화되었는지 여부를 추적합니다 (예: 로그아웃, 토큰 교체 시)
  @Column({ default: false, name: 'is_revoked' })
  isRevoked: boolean;

  // (선택) 보안 강화를 위해 토큰 발급 시의 IP와 User-Agent 저장
  @Column({ length: 45, nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
