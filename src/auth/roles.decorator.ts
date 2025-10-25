// 역할(Role) 기반 접근 제어를 위한 커스텀 데코레이터를 정의합니다.
import { SetMetadata } from '@nestjs/common'; // [1] NestJS에서 제공하는 메타데이터 설정 유틸리티를 가져옵니다.

export const ROLES_KEY = 'roles'; // [2] 역할(Role) 정보를 저장하는 데 사용할 메타데이터 키를 정의합니다.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles); // [3] 역할 정보를 메타데이터로 설정하는 데코레이터를 정의합니다.
//    - ...roles: string[] : 가변 인자로 여러 개의 역할을 받을 수 있습니다.
//    - SetMetadata(ROLES_KEY, roles) : 주어진 역할들을 'roles' 키로 메타데이터에 저장합니다.
//    - 이 데코레이터는 컨트롤러 핸들러나 클래스에 적용되어 해당 핸들러/클래스에 필요한 역할 정보를 지정하는 데 사용됩니다.
