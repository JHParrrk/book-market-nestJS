import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Injectable({ scope: Scope.REQUEST }) // Request 스코프로 변경
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
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;
    return requiredRoles.some((role) => user.role.includes(role));
  }
}
