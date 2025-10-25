// Express의 기본 Request 객체를 확장하여 사용자 정보를 추가한 커스텀 인터페이스를 정의합니다.
import { Request } from 'express'; // [1] Express 프레임워크의 기본 Request 객체를 가져옵니다.
import { User } from '../../users/user.entity'; // [2] 사용자 엔터티(User)를 가져옵니다. 이는 데이터베이스 테이블과 매핑된 클래스일 가능성이 높습니다.

export interface RequestWithUser extends Request {
  // [3] Request 인터페이스를 확장하여 사용자 정보를 추가합니다.
  user: User; // [4] 사용자 정보를 나타내는 속성. User 엔터티 타입으로 정의되어 있어 req.user가 User 타입임을 보장합니다.
}
