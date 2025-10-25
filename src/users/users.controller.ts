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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto'; // DTO를 사용한 유효성 검사
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
// [추가] 커스텀 Request 타입을 import 합니다.
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- 인증이 필요 없는 라우트 ---
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    // class-validator를 사용한 DTO로 유효성 검사 자동화
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginData: Pick<User, 'email' | 'password'>) {
    // 로그인 로직은 리프레시 토큰을 쿠키에 설정해야 하므로 Response 객체가 필요할 수 있음
    // (@Res({ passthrough: true }) res: Response)
    return this.usersService.login(loginData.email, loginData.password);
  }

  // --- 인증이 필요한 라우트 ---
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    // [수정] 타입을 명시합니다.
    // req.user는 이제 User 타입으로 인식됩니다.
    return this.usersService.findOneById(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    // [수정] 타입을 명시합니다.
    // req.user.role과 req.user.id가 타입-세이프하게 접근됩니다.
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 프로필만 조회할 수 있습니다.');
    }
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser, // [수정] 타입을 명시합니다.
  ) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 프로필만 수정할 수 있습니다.');
    }
    return this.usersService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    // [수정] 타입을 명시합니다.
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 계정만 삭제할 수 있습니다.');
    }
    return this.usersService.remove(id);
  }

  // --- [수정된 메서드] ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(id, updateUserRoleDto.role);
  }
}
