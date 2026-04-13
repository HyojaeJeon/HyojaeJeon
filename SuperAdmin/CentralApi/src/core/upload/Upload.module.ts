/**
 * 한국어: 파일 업로드 글로벌 모듈.
 *   UploadService 를 전역으로 내보내어 다른 도메인 서비스에서 파일 업로드를 사용할 수 있게 한다.
 *   StorageProvider 의 기본 구현체로 LocalStorageProvider 를 등록한다.
 *
 *   향후 Cloudflare Images / R2 전환 시:
 *     1. CloudflareStorageProvider 구현체를 만든다.
 *     2. 아래 providers 에서 useClass 를 교체한다.
 *     3. 나머지 코드 변경 없음.
 *
 * Tiếng Việt: Module upload file toàn cục.
 *   Export UploadService toàn cục để các service domain khác có thể sử dụng upload file.
 *   Đăng ký LocalStorageProvider làm triển khai mặc định của StorageProvider.
 *
 *   Khi chuyển sang Cloudflare Images / R2:
 *     1. Tạo triển khai CloudflareStorageProvider.
 *     2. Thay useClass bên dưới trong providers.
 *     3. Không cần thay đổi code còn lại.
 */
import { Global, Module } from '@nestjs/common';
import { STORAGE_PROVIDER } from './storageProvider.interface';
import { LocalStorageProvider } from './LocalStorage.provider';
import { UploadService } from './Upload.service';
import { UploadController } from './Upload.controller';

@Global()
@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalStorageProvider,
    },
    UploadService,
  ],
  exports: [UploadService],
})
export class UploadModule {}
