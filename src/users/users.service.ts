import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { User } from './user.entity/user.entity';
import { RefreshToken } from './user.entity/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// 상수 정의
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 리프레시 토큰 만료 시간 계산
   */
  private getRefreshTokenExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    return expiresAt;
  }

  /**
   * 회원가입
   */
  async register(
    userData: Pick<
      User,
      'email' | 'password' | 'name' | 'address' | 'phoneNumber'
    >,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findOneBy({
      email: userData.email,
    });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    if (!userData.password) {
      throw new UnauthorizedException('비밀번호를 입력해주세요.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result;
  }

  /**
   * 로그인 (보안 정책 반영) - 진단용 로그 추가
   */
  async login(
    email: string,
    pass: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      console.log(`[login] 1. 로그인 프로세스 시작. 이메일: ${email}`);
      const user = await this.userRepository.findOneBy({ email });
      if (!user || !user.password) {
        console.error(
          `[login] 오류: 사용자를 찾을 수 없거나 비밀번호가 설정되지 않았습니다.`,
        );
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 유효하지 않습니다.',
        );
      }
      console.log(`[login] 2. 데이터베이스에서 사용자 조회 성공.`);

      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) {
        console.error(`[login] 오류: 비밀번호가 일치하지 않습니다.`);
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 유효하지 않습니다.',
        );
      }
      console.log(`[login] 3. 비밀번호 검증 성공.`);

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      // 환경 변수에서 JWT 비밀 키를 가져옵니다.
      const accessSecret = this.configService.get<string>('ACCESS_SECRET_KEY');
      const refreshSecret =
        this.configService.get<string>('REFRESH_SECRET_KEY');

      console.log(
        `[login] 4. JWT 비밀 키 로드 확인: ACCESS_SECRET_KEY 존재 여부: ${!!accessSecret}, REFRESH_SECRET_KEY 존재 여부: ${!!refreshSecret}`,
      );

      if (!accessSecret || !refreshSecret) {
        console.error(
          '[login] 치명적 오류: .env 파일에 ACCESS_SECRET_KEY 또는 REFRESH_SECRET_KEY이(가) 정의되지 않았습니다.',
        );
        throw new Error('서버 설정 오류: JWT 비밀 키가 누락되었습니다.');
      }

      // AccessToken은 기본 secret으로, RefreshToken은 별도 secret으로 생성
      const accessToken = this.jwtService.sign(payload); // 모듈에 등록된 기본 secret (ACCESS_SECRET_KEY) 사용
      const refreshTokenString = this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
      });
      console.log(`[login] 5. 액세스 토큰 및 리프레시 토큰 생성 완료.`);

      await this.refreshTokenRepository.update(
        { user: { id: user.id }, isRevoked: false },
        { isRevoked: true },
      );
      console.log(`[login] 6. 기존 활성 리프레시 토큰 무효화 처리 완료.`);

      const hashedToken = await bcrypt.hash(refreshTokenString, 10);
      const newRefreshToken = this.refreshTokenRepository.create({
        user,
        hashedToken,
        expiresAt: this.getRefreshTokenExpirationDate(),
        ipAddress,
        userAgent,
      });

      await this.refreshTokenRepository.save(newRefreshToken);
      console.log(`[login] 7. 새로운 리프레시 토큰 데이터베이스에 저장 완료.`);

      return { accessToken, refreshToken: refreshTokenString };
    } catch (error) {
      console.error('[login] 로그인 처리 중 예외 발생:', error);
      throw error; // 에러를 다시 던져서 NestJS의 기본 예외 처리기가 응답을 생성하도록 함
    }
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
        'phoneNumber',
        'role',
        'createdAt',
      ],
    });
  }

  /**
   * 특정 사용자 조회 (ID 기반)
   */
  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['refreshToken'],
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOneById(id);
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  /**
   * 사용자 역할 변경
   */
  async updateUserRole(userId: number, role: string): Promise<User> {
    const user = await this.findOneById(userId);
    user.role = role;
    return this.userRepository.save(user);
  }

  /**
   * 사용자 삭제 (소프트 삭제)
   */
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('삭제할 사용자를 찾을 수 없습니다.');
    }
  }

  /**
   * 리프레시 토큰으로 액세스 토큰 갱신 - 진단용 로그 추가
   */
  async refreshAccessToken(
    refreshTokenString: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      console.log(`[refresh] 1. 토큰 갱신 프로세스 시작.`);
      const refreshSecret =
        this.configService.getOrThrow<string>('REFRESH_SECRET_KEY');
      console.log(`[refresh] 2. 리프레시 토큰 비밀 키 로드 성공.`);

      const payload = this.jwtService.verify<JwtPayload>(refreshTokenString, {
        secret: refreshSecret,
      });
      console.log(`[refresh] 3. 리프레시 토큰 검증 및 payload 디코딩 성공.`);

      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user) {
        console.error(
          `[refresh] 오류: payload에 해당하는 사용자를 찾을 수 없음.`,
        );
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }
      console.log(`[refresh] 4. 데이터베이스에서 사용자 조회 성공.`);

      const userTokens = await this.refreshTokenRepository.find({
        where: {
          user: { id: user.id },
          expiresAt: MoreThan(new Date()),
          isRevoked: false,
        },
      });
      console.log(
        `[refresh] 5. 데이터베이스에서 유효한 리프레시 토큰 ${userTokens.length}개 조회.`,
      );
      if (userTokens.length === 0)
        throw new UnauthorizedException('유효한 리프레시 토큰이 없습니다.');

      let matchedToken: RefreshToken | null = null;
      for (const token of userTokens) {
        if (await bcrypt.compare(refreshTokenString, token.hashedToken)) {
          matchedToken = token;
          break;
        }
      }
      console.log(
        `[refresh] 6. 제공된 리프레시 토큰과 DB의 해시된 토큰 비교 결과: ${matchedToken ? '일치' : '불일치'}.`,
      );

      if (!matchedToken) {
        console.warn(
          `[refresh] 보안 경고: 유효하지 않은 토큰 사용 시도 감지. 사용자 ID: ${user.id}의 모든 토큰을 무효화합니다.`,
        );
        await this.refreshTokenRepository.update(
          { user: { id: user.id } },
          { isRevoked: true },
        );
        throw new UnauthorizedException(
          '유효하지 않은 리프레시 토큰입니다. 보안을 위해 모든 세션이 종료되었습니다.',
        );
      }

      matchedToken.isRevoked = true;
      await this.refreshTokenRepository.save(matchedToken);
      console.log(`[refresh] 7. 사용된 리프레시 토큰 무효화 완료.`);

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const newAccessToken = this.jwtService.sign(newPayload); // 기본 secret (ACCESS_SECRET_KEY) 사용
      const newRefreshTokenString = this.jwtService.sign(newPayload, {
        secret: refreshSecret,
        expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
      });
      console.log(
        `[refresh] 8. 새로운 액세스 토큰 및 리프레시 토큰 생성 완료.`,
      );

      const newHashedToken = await bcrypt.hash(newRefreshTokenString, 10);
      const newRefreshToken = this.refreshTokenRepository.create({
        user,
        hashedToken: newHashedToken,
        expiresAt: this.getRefreshTokenExpirationDate(),
        ipAddress,
        userAgent,
      });
      await this.refreshTokenRepository.save(newRefreshToken);
      console.log(
        `[refresh] 9. 새로운 리프레시 토큰 데이터베이스에 저장 완료.`,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenString,
      };
    } catch (error) {
      console.error('[refresh] 토큰 갱신 처리 중 예외 발생:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  /**
   * 로그아웃
   */
  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
  }

  /**
   * 만료된 리프레시 토큰 정리
   */
  async cleanupExpiredRefreshTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
