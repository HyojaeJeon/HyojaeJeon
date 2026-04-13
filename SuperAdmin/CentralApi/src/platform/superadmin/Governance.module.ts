/**
 * 한국어: Governance aggregator — superadmin 계층의 license + platform-policy 두 leaf 를
 *   하나의 import 점으로 묶어주는 그룹 모듈. 자체에는 provider/resolver/service 가 없다.
 *
 *   이 파일은 그룹 폴더 (`governance/`) 가 사라진 뒤 superadmin 의 평탄한 두 leaf
 *   (`license/`, `platform-policy/`) 를 연결하는 단일 진입점 역할을 한다.
 *
 *   기존 RuntimePolicyModule 을 GovernanceModule 로 리네임하여 표준 그룹 모듈 명명을 따른다.
 *
 * Tiếng Việt: Module gộp governance — không chứa provider, chỉ aggregate hai leaf con.
 */
import { Module } from '@nestjs/common';
import { LicenseModule } from './license/License.module';
import { PlatformPolicyModule } from './platformPolicy/PlatformPolicy.module';

@Module({
  imports: [LicenseModule, PlatformPolicyModule],
  exports: [LicenseModule, PlatformPolicyModule],
})
export class GovernanceModule {}
