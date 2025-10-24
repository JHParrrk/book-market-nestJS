import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType(CreateUserDto)는 CreateUserDto의 모든 필드를
// 선택적으로 (optional, ? 붙은 것처럼) 만들어줍니다.
export class UpdateUserDto extends PartialType(CreateUserDto) {}