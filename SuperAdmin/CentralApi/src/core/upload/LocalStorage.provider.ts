/**
 * 한국어: 로컬 디스크 파일 저장소 프로바이더.
 *   uploads/images/ 또는 uploads/files/ 디렉토리에 파일을 저장한다.
 *   파일명은 UUID + 타임스탬프로 충돌 없이 고유하게 생성한다.
 *   향후 Cloudflare Images/R2 프로바이더로 교체할 때 이 파일만 대체하면 된다.
 *
 *   저장 경로 구조:
 *     uploads/
 *       images/{uuid}-{timestamp}.{ext}
 *       files/{uuid}-{timestamp}.{ext}
 *
 *   getUrl() 반환값: /api/v1/uploads/images/{filename} 또는 /api/v1/uploads/files/{filename}
 *
 * Tiếng Việt: Provider lưu trữ file cục bộ trên đĩa.
 *   Lưu file vào thư mục uploads/images/ hoặc uploads/files/.
 *   Tên file được tạo duy nhất bằng UUID + timestamp để tránh trùng.
 *   Khi chuyển sang Cloudflare Images/R2, chỉ cần thay thế file này.
 *
 *   Cấu trúc lưu trữ:
 *     uploads/
 *       images/{uuid}-{timestamp}.{ext}
 *       files/{uuid}-{timestamp}.{ext}
 *
 *   Giá trị trả về getUrl(): /api/v1/uploads/images/{filename} hoặc /api/v1/uploads/files/{filename}
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { join, extname } from 'node:path';
import { mkdir, writeFile, unlink, access } from 'node:fs/promises';

import type {
  StorageProvider,
  StorageProviderSaveResult,
  UploadCategory,
} from './storageProvider.interface';

/**
 * 한국어: 카테고리 → 서브 디렉토리 매핑.
 * Tiếng Việt: Mapping category → thư mục con.
 */
const CATEGORY_DIR: Record<UploadCategory, string> = {
  IMAGE: 'images',
  FILE: 'files',
};

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly baseDir: string;

  constructor() {
    // 한국어: 프로젝트 루트의 uploads/ 디렉토리를 기본 저장 경로로 사용
    // Tiếng Việt: Sử dụng thư mục uploads/ ở gốc dự án làm đường dẫn lưu trữ mặc định
    this.baseDir = join(process.cwd(), 'uploads');
  }

  async save(
    file: Buffer,
    originalName: string,
    mimeType: string,
    category: UploadCategory,
  ): Promise<StorageProviderSaveResult> {
    const subDir = CATEGORY_DIR[category];
    const dir = join(this.baseDir, subDir);

    // 한국어: 디렉토리가 없으면 재귀적으로 생성
    // Tiếng Việt: Tạo thư mục đệ quy nếu chưa tồn tại
    await mkdir(dir, { recursive: true });

    // 한국어: 고유 파일명 생성 — {uuid}-{timestamp}.{ext}
    // Tiếng Việt: Tạo tên file duy nhất — {uuid}-{timestamp}.{ext}
    const ext = extname(originalName).toLowerCase() || this.mimeToExt(mimeType);
    const uniqueName = `${randomUUID()}-${Date.now()}${ext}`;
    const filePath = join(dir, uniqueName);

    await writeFile(filePath, file);
    this.logger.log(`File saved: ${filePath} (${mimeType}, ${file.length} bytes)`);

    // 한국어: key = "images/{filename}" 또는 "files/{filename}" (상대 경로)
    // Tiếng Việt: key = "images/{filename}" hoặc "files/{filename}" (đường dẫn tương đối)
    const key = `${subDir}/${uniqueName}`;

    return {
      key,
      url: this.getUrl(key),
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.baseDir, key);
    try {
      await access(filePath);
      await unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch {
      // 한국어: 파일이 이미 없으면 무시 (멱등성 보장)
      // Tiếng Việt: Bỏ qua nếu file đã không tồn tại (đảm bảo idempotent)
      this.logger.warn(`File not found for deletion: ${filePath}`);
    }
  }

  getUrl(key: string): string {
    return `/api/v1/uploads/${key}`;
  }

  /**
   * 한국어: 확장자가 없을 때 MIME 타입에서 확장자를 추론한다.
   * Tiếng Việt: Suy luận đuôi mở rộng từ MIME type khi không có extension.
   */
  private mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'application/json': '.json',
      'text/plain': '.txt',
      'text/csv': '.csv',
    };
    return map[mimeType] ?? '';
  }
}
