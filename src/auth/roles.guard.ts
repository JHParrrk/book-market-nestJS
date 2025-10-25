import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
// [추가] 커스텀 Request 타입을 import 합니다.
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    // [수정] 타입을 명시하여 user 객체를 안전하게 사용합니다.
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    // user 객체가 없거나 role 속성이 없는 경우를 안전하게 처리합니다.
    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.some((role) => user.role.includes(role));
  }
}
