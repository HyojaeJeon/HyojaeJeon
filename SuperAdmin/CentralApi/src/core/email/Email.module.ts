/**
 * EmailModule — 이메일 발송 인프라를 앱 전체에서 사용할 수 있게 등록합니다.
 *
 * 구성:
 * - EmailService: 이메일 큐잉(Redis Stream) 및 발송(Nodemailer SMTP)
 * - EmailTemplateService: Handlebars 템플릿 로드 및 렌더링
 *
 * 의존:
 * - RedisModule: 비동기 발송 큐 (email:outbox stream)
 * - ConfigService: SMTP 연결 정보 (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS 등)
 *
 * @Global() — 앱 어디서든 EmailService를 주입받을 수 있게 전역 등록
 */
import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@core/redis/Redis.module';
import { EmailService } from './Email.service';
import { EmailTemplateService } from './EmailTemplate.service';

@Global()
@Module({
  imports: [RedisModule],
  providers: [EmailService, EmailTemplateService],
  exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}
