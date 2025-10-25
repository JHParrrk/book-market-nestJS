// NestJS의 컨트롤러로, 사용자 관련 엔드포인트를 정의합니다.
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common'; // NestJS의 주요 데코레이터와 예외 처리, 유틸리티를 가져옵니다.
import { UsersService } from './users.service'; // 사용자 관련 로직을 처리하는 서비스
import { User } from './user.entity'; // 사용자 엔터티 정의
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // JWT 인증 가드
import { RolesGuard } from '../auth/roles.guard'; // 역할 기반 접근 제어 가드
import { Roles } from '../auth/roles.decorator'; // 역할 데코레이터
import { CreateUserDto } from './dto/create-user.dto'; // 사용자 생성 시 데이터 유효성 검사에 사용할 DTO
import { UpdateUserDto } from './dto/update-user.dto'; // 사용자 정보 수정 시 사용할 DTO
import { UpdateUserRoleDto } from './dto/update-user-role.dto'; // 사용자 역할 수정 시 사용할 DTO
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface'; // 사용자 정보를 포함하는 커스텀 요청 타입

// 'users'라는 경로로 접근 가능한 컨트롤러를 정의합니다.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {} // UsersService를 주입받아 사용자 관련 로직을 처리합니다.

  // --- 인증이 필요 없는 라우트 ---
  @Post('register') // POST 요청을 'users/register' 경로로 매핑합니다.
  register(@Body() createUserDto: CreateUserDto) {
    // 요청 본문(@Body)을 DTO로 매핑하여 유효성 검사를 수행합니다.
    return this.usersService.register(createUserDto); // 사용자 등록 로직 호출
  }

  @Post('login') // POST 요청을 'users/login' 경로로 매핑합니다.
  login(@Body() loginData: Pick<User, 'email' | 'password'>) {
    // 이메일과 비밀번호만 포함한 요청 본문을 처리
    return this.usersService.login(loginData.email, loginData.password); // 로그인 로직 호출
  }

  // --- 인증이 필요한 라우트 ---
  @UseGuards(JwtAuthGuard) // JWT 인증이 필요한 라우트입니다.
  @Get('me') // GET 요청을 'users/me' 경로로 매핑합니다.
  getMe(@Req() req: RequestWithUser) {
    // 사용자 인증 정보를 포함한 요청 객체를 처리
    return this.usersService.findOneById(req.user.id); // 현재 인증된 사용자의 정보를 반환
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // JWT 인증과 역할 기반 접근 제어가 필요한 라우트입니다.
  @Roles('admin') // 'admin' 역할이 필요한 라우트로 제한합니다.
  @Get() // GET 요청을 'users' 경로로 매핑합니다.
  findAll() {
    return this.usersService.findAll(); // 전체 사용자 정보를 반환
  }

  @UseGuards(JwtAuthGuard) // JWT 인증이 필요한 라우트입니다.
  @Get(':id') // GET 요청을 'users/:id' 경로로 매핑합니다.
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    // URL 경로에서 ID를 파싱하여 가져옵니다. RequestWithUser 타입의 요청 객체를 처리
    // 그 전엔 req.user.role, req.user.id 이렇게 가져와서 타입이 안전하지 않았음
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 프로필만 조회할 수 있습니다.'); // 권한 없는 요청을 거부
    }
    return this.usersService.findOneById(id); // 특정 사용자 정보를 반환
  }

  @UseGuards(JwtAuthGuard) // JWT 인증이 필요한 라우트입니다.
  @Patch(':id') // PATCH 요청을 'users/:id' 경로로 매핑합니다.
  updateUser(
    @Param('id', ParseIntPipe) id: number, // URL 경로에서 ID를 파싱하여 가져옵니다.
    @Body() updateUserDto: UpdateUserDto, // 요청 본문을 DTO로 매핑
    @Req() req: RequestWithUser, // 인증된 사용자 정보가 포함된 요청 객체
  ) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 프로필만 수정할 수 있습니다.'); // 권한 없는 요청을 거부
    }
    return this.usersService.updateUser(id, updateUserDto); // 사용자 정보 수정 로직 호출
  }

  @UseGuards(JwtAuthGuard) // JWT 인증이 필요한 라우트입니다.
  @Delete(':id') // DELETE 요청을 'users/:id' 경로로 매핑합니다.
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    // URL 경로에서 ID를 파싱하여 가져옵니다.
    // RequestWithUser 타입의 요청 객체를 처리
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 계정만 삭제할 수 있습니다.'); // 권한 없는 요청을 거부
    }
    return this.usersService.remove(id); // 사용자 계정 삭제 로직 호출
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // JWT 인증과 역할 기반 접근 제어가 필요한 라우트입니다.
  @Roles('admin') // 'admin' 역할이 필요한 라우트로 제한합니다.
  @Patch(':id/role') // PATCH 요청을 'users/:id/role' 경로로 매핑합니다.
  updateUserRole(
    @Param('id', ParseIntPipe) id: number, // URL 경로에서 ID를 파싱하여 가져옵니다.
    @Body() updateUserRoleDto: UpdateUserRoleDto, // 요청 본문을 DTO로 매핑
  ) {
    return this.usersService.updateUserRole(id, updateUserRoleDto.role); // 사용자 역할 수정 로직 호출
  }
}
