// UsersController에 대한 테스트를 작성하기 위한 기본 테스트 파일입니다.
import { Test, TestingModule } from '@nestjs/testing'; // NestJS의 테스트 유틸리티를 가져옵니다.
import { UsersController } from './users.controller'; // 테스트 대상인 UsersController를 가져옵니다.

describe('UsersController', () => {
  // UsersController에 대한 테스트 스위트를 정의합니다.
  let controller: UsersController; // 테스트에서 사용할 UsersController 인스턴스를 선언합니다.

  beforeEach(async () => {
    // 각 테스트가 실행되기 전에 실행되는 비동기 설정 로직입니다.
    const module: TestingModule = await Test.createTestingModule({
      // 테스트 모듈을 생성합니다.
      controllers: [UsersController], // 테스트할 컨트롤러를 등록합니다.
    }).compile(); // 테스트 모듈을 컴파일합니다.

    controller = module.get<UsersController>(UsersController); // 컴파일된 모듈에서 UsersController 인스턴스를 가져옵니다.
  });

  it('should be defined', () => {
    // 테스트 케이스를 정의합니다. 이 테스트는 UsersController가 정의되어 있는지 확인합니다.
    expect(controller).toBeDefined(); // controller가 정의되어 있어야 합니다. (null, undefined가 아니어야 합니다.)
  });
});
