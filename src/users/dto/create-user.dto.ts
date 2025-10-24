import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력하세요.' })
  email: string;

  @IsString()
  @MinLength(4, { message: '비밀번호는 최소 4자 이상이어야 합니다.' })
  password: string;

  @IsString()
  name: string;

  @IsOptional() // 선택적으로 받을 수 있도록 설정
  @IsString()
  address?: string;

  @IsOptional() // 선택적으로 받을 수 있도록 설정
  @IsString()
  phone_number?: string;
}