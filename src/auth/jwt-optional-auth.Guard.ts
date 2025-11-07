import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  // NestJS의 내장 Logger를 사용하여 컨텍스트 있는 로그를 남깁니다.
  private readonly logger = new Logger(JwtOptionalAuthGuard.name);

  /**
   * handleRequest 메서드를 오버라이딩하여 선택적 인증을 구현합니다.
   *
   * @param err - 인증 로직 실행 중 발생한 예외
   * @param user - JwtStrategy의 validate 메서드가 반환한 사용자 객체
   * @param info - 토큰 관련 오류 정보 (예: 만료, 잘못된 서명 등)
   */
  handleRequest<TUser = any>(
    err: unknown,
    user: TUser,
    info: unknown,
    _context: ExecutionContext,
  ): TUser | undefined {
    // 요청 컨텍스트에서 HTTP 요청 객체를 가져옵니다.
    const request = _context
      .switchToHttp()
      .getRequest<{ method: string; url: string }>();

    // 요청 메서드와 URL을 로깅합니다.
    this.logger.debug(`Request Method: ${request.method}, URL: ${request.url}`);

    // 1. JWT 관련 오류가 발생한 경우, 디버깅을 위해 로그를 남깁니다.
    if (info) {
      // 토큰 만료, 잘못된 토큰 형식 등의 정보를 로깅합니다.
      if (info instanceof JsonWebTokenError) {
        this.logger.debug(`Invalid JWT provided: ${info.message}`);
      } else if (typeof info === 'object' && info !== null) {
        // info가 객체일 경우, 메시지 속성을 로깅
        const message = (info as { message?: string }).message;
        if (message) {
          this.logger.debug(`Authentication info: ${message}`);
        }
      } else if (typeof info === 'string') {
        this.logger.debug(`Authentication info: ${info}`);
      }
    }

    // 2. 인증 과정에서 예외가 발생했거나(err), 사용자 정보(user)가 없는 경우,
    //    요청을 중단시키지 않고 undefined를 반환하여 계속 진행시킵니다.
    if (err || !user) {
      return undefined;
    }

    // 3. 인증에 성공한 경우, 사용자 객체를 반환합니다.
    return user;
  }
}
