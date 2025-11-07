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
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './user.dto/create-user.dto';
import { UpdateUserDto } from './user.dto/update-user.dto';
import { UpdateUserRoleDto } from './user.dto/update-user-role.dto';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- 인증이 필요 없는 라우트 ---
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    const userData = {
      ...createUserDto,
      phone_number: createUserDto.phone_number || '', // 기본값 처리
    };
    return this.usersService.register(userData);
  }

  @Post('login')
  login(
    @Body() loginData: Pick<User, 'email' | 'password'>,
    @Req() request: Request,
  ) {
    if (!loginData.email || !loginData.password) {
      throw new BadRequestException(
        '이메일과 비밀번호는 필수 입력 항목입니다.',
      );
    }
    const ipAddress = request.ip || '';
    const userAgent = request.headers['user-agent'] || '';

    return this.usersService.login(
      loginData.email,
      loginData.password,
      ipAddress,
      userAgent,
    );
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string, @Req() request: Request) {
    const ipAddress = request.ip || '';
    const userAgent = request.headers['user-agent'] || '';
    return this.usersService.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent,
    );
  }

  // --- 인증이 필요한 라우트 ---
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
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
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 프로필만 수정할 수 있습니다.');
    }
    return this.usersService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('자신의 계정만 삭제할 수 있습니다.');
    }
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(id, updateUserRoleDto.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: RequestWithUser) {
    return this.usersService.logout(req.user.id);
  }
}
