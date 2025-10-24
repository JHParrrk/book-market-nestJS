import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // JWT 서비스 주입
  ) {}

  /**
   * 회원가입
   * @param userData - email, password, name 등 사용자 정보
   */
  async register(
    userData: Pick<User, 'email' | 'password' | 'name' | 'address' | 'phone_number'>,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findOneBy({ email: userData.email });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser; // 비밀번호를 제외하고 반환
    return result;
  }

  /**
   * 로그인
   * @param email
   * @param pass
   */
  async login(email: string, pass: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 유효하지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 유효하지 않습니다.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * 모든 사용자 조회
   */
  findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'address', 'phone_number', 'role', 'created_at'],
    });
  }

  /**
   * 특정 사용자 조회 (ID 기반)
   * @param id
   */
  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  /**
   * 사용자 정보 업데이트
   * @param id
   * @param updateData
   */
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOneById(id); // 사용자가 존재하는지 먼저 확인

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // updateData를 기존 user 객체에 병합
    Object.assign(user, updateData);
    
    return this.userRepository.save(user);
  }

  /**
   * 사용자 역할 변경
   * @param userId
   * @param role
   */
  async updateUserRole(userId: number, role: string): Promise<User> {
    const user = await this.findOneById(userId);
    user.role = role;
    return this.userRepository.save(user);
  }

  /**
   * 사용자 삭제 (소프트 삭제)
   * @param id
   */
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('삭제할 사용자를 찾을 수 없습니다.');
    }
  }
}