// 역할(Role) 기반 접근 제어를 구현하기 위한 NestJS 가드입니다.
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'; // [1] NestJS의 CanActivate 인터페이스와 관련 데코레이터를 가져옵니다.
import { Reflector } from '@nestjs/core'; // [2] 메타데이터를 가져오기 위한 Reflector를 가져옵니다.
import { ROLES_KEY } from './roles.decorator'; // [3] 역할(Role) 메타데이터 키를 가져옵니다.
// [4] 커스텀 Request 타입을 import 합니다.
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Injectable() // [5] NestJS의 의존성 주입 시스템에서 관리되는 서비스임을 나타냅니다.
export class RolesGuard implements CanActivate {
  // [6] CanActivate 인터페이스를 구현하여 가드로 동작합니다.
  constructor(private reflector: Reflector) {} // [7] Reflector를 주입받아 메타데이터를 읽을 수 있도록 설정합니다.

  canActivate(context: ExecutionContext): boolean {
    // [8] 요청이 핸들러에 도달할 수 있는지 여부를 결정합니다.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>( // [9] Reflector를 사용하여 메타데이터에서 역할 정보를 가져옵니다.
      ROLES_KEY, // [10] roles.decorator.ts 에서 설정한 메타데이터 키를 사용합니다.
      [context.getHandler(), context.getClass()], // [11] 핸들러와 클래스 수준에서 메타데이터를 확인합니다.
    );
    if (!requiredRoles) {
      // [12] 메타데이터에 역할 정보가 없으면 모든 요청을 허용합니다.
      return true;
    }

    // [13] HTTP 요청 컨텍스트에서 요청 객체를 가져옵니다.
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request; // [14] 요청 객체에서 인증된 사용자 정보를 가져옵니다.

    // [15] 사용자 정보가 없거나 역할(role) 속성이 없는 경우 요청을 차단합니다.
    if (!user || !user.role) {
      return false;
    }

    // [16] 사용자 역할이 필요한 역할 배열(requiredRoles) 중 하나라도 포함되어 있는지 확인합니다.
    return requiredRoles.some((role) => user.role.includes(role));
  }
}
