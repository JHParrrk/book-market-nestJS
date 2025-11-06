import { IsString, IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['member', 'admin'], {
    message: '역할은 "member" 또는 "admin"만 가능합니다.',
  })
  role: string;
}
