// 사용자 관련 서비스 로직을 처리하는 NestJS 서비스
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'; // NestJS에서 제공하는 예외 처리 클래스
import { InjectRepository } from '@nestjs/typeorm'; // TypeORM Repository 주입을 위한 데코레이터
import { Repository } from 'typeorm'; // TypeORM의 Repository를 사용
import { User } from './user.entity'; // 사용자 엔터티 정의
import * as bcrypt from 'bcrypt'; // 비밀번호 해싱과 비교를 위한 bcrypt 라이브러리
import { JwtService } from '@nestjs/jwt'; // JWT 생성 및 검증을 위한 NestJS 서비스
@Injectable() // 이 클래스가 NestJS의 의존성 주입 시스템에서 관리되는 서비스임을 나타냄
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // User 엔터티와 연결된 Repository 주입
    private readonly jwtService: JwtService, // JWT 서비스 주입
  ) {}

  /**
   * 회원가입
   * @param userData - email, password, name 등 사용자 정보
   */
  async register(
    userData: Pick<
      User,
      'email' | 'password' | 'name' | 'address' | 'phone_number'
    >,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findOneBy({
      email: userData.email, // 중복 이메일 확인
    });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10); // 비밀번호 해싱

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword, // 해싱된 비밀번호 저장
    });

    const savedUser = await this.userRepository.save(newUser); // 사용자 정보 저장
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
    const user = await this.userRepository.findOneBy({ email }); // 이메일로 사용자 조회
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 유효하지 않습니다.',
      ); // 사용자 없음 예외 처리
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 유효하지 않습니다.',
      ); // 비밀번호 불일치 예외 처리
    }

    const payload = { sub: user.id, email: user.email, role: user.role }; // JWT 페이로드 생성
    return {
      accessToken: this.jwtService.sign(payload), // JWT 액세스 토큰 생성 및 반환
    };
  }

  /**
   * 모든 사용자 조회
   */
  findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'email',
        'name',
        'address',
        'phone_number',
        'role',
        'created_at',
      ],
    }); // 비밀번호 제외하고 모든 사용자 정보 반환
  }

  /**
   * 특정 사용자 조회 (ID 기반)
   * @param id
   */
  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id }); // ID로 사용자 조회
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user; // 사용자 정보 반환
  }

  /**
   * 사용자 정보 업데이트
   * @param id
   * @param updateData
   */
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOneById(id); // 사용자가 존재하는지 먼저 확인

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10); // 비밀번호가 변경되는 경우 해싱
    }

    // updateData를 기존 user 객체에 병합
    Object.assign(user, updateData);

    return this.userRepository.save(user); // 업데이트된 사용자 정보 저장 및 반환
  }

  /**
   * 사용자 역할 변경
   * @param userId
   * @param role
   */
  async updateUserRole(userId: number, role: string): Promise<User> {
    const user = await this.findOneById(userId); // 사용자가 존재하는지 먼저 확인
    user.role = role; // 역할 업데이트
    return this.userRepository.save(user); // 업데이트된 사용자 정보 저장 및 반환
  }

  /**
   * 사용자 삭제 (소프트 삭제)
   * @param id
   */
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.softDelete(id); // 소프트 삭제 수행
    if (result.affected === 0) {
      throw new NotFoundException('삭제할 사용자를 찾을 수 없습니다.'); // 삭제할 사용자가 없는 경우 예외 처리
    }
  }
}
