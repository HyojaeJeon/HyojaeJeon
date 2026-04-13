/**
 * 한국어: 파일 업로드 서비스.
 *   StorageProvider 를 주입받아 파일 저장/삭제/롤백을 처리한다.
 *   MIME 타입 검증, 파일 크기 제한을 담당하며,
 *   부모 작업 실패 시 rollback() 으로 업로드된 파일을 일괄 삭제할 수 있다.
 *
 *   사용법 (다른 서비스에서):
 *     const result = await this.uploadService.uploadSingle(fileBuffer, 'IMAGE');
 *     // result = { key, url, originalName, mimeType, size }
 *
 *     // 부모 작업 실패 시
 *     await this.uploadService.rollback([result.key]);
 *
 * Tiếng Việt: Service upload file.
 *   Inject StorageProvider để xử lý lưu/xóa/rollback file.
 *   Chịu trách nhiệm kiểm tra MIME type, giới hạn kích thước file,
 *   và rollback() để xóa hàng loạt file đã upload khi thao tác cha thất bại.
 *
 *   Cách dùng (từ service khác):
 *     const result = await this.uploadService.uploadSingle(fileBuffer, 'IMAGE');
 *     // result = { key, url, originalName, mimeType, size }
 *
 *     // Khi thao tác cha thất bại
 *     await this.uploadService.rollback([result.key]);
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DomainError } from '@core/errors/DomainError';
import { ErrorCode } from '@core/errors/errorCodes';

import type { StorageProvider, UploadCategory } from './storageProvider.interface';
import { STORAGE_PROVIDER } from './storageProvider.interface';

/**
 * 한국어: 이미지 업로드 시 허용되는 MIME 타입 목록.
 * Tiếng Việt: Danh sách MIME type được phép khi upload ảnh.
 */
const IMAGE_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

/**
 * 한국어: 기본 최대 파일 크기 (10MB).
 * Tiếng Việt: Kích thước file tối đa mặc định (10MB).
 */
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadResult {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,
  ) {}

  /**
   * 한국어: 단일 파일 업로드. MIME 타입과 크기를 검증한 후 저장한다.
   * Tiếng Việt: Upload file đơn. Kiểm tra MIME type và kích thước trước khi lưu.
   *
   * @param file - 업로드 파일 정보 (buffer, originalName, mimeType)
   * @param category - 'IMAGE' | 'FILE'
   * @param allowedMimeTypes - 허용 MIME 타입 (IMAGE 카테고리 기본: 이미지 전용, FILE 카테고리 기본: 전체)
   * @param maxSize - 최대 파일 크기 (기본 10MB)
   */
  async uploadSingle(
    file: UploadFileInput,
    category: UploadCategory,
    allowedMimeTypes?: string[],
    maxSize: number = DEFAULT_MAX_FILE_SIZE,
  ): Promise<UploadResult> {
    this.validateFile(file, category, allowedMimeTypes, maxSize);

    const result = await this.storage.save(
      file.buffer,
      file.originalName,
      file.mimeType,
      category,
    );

    this.logger.log(
      `Uploaded: ${file.originalName} → ${result.key} (${file.mimeType}, ${file.buffer.length} bytes)`,
    );

    return {
      key: result.key,
      url: result.url,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.buffer.length,
    };
  }

  /**
   * 한국어: 다중 파일 업로드. 각 파일에 대해 uploadSingle 을 호출한다.
   *   하나라도 실패하면 이미 업로드된 파일을 롤백한 뒤 에러를 던진다.
   * Tiếng Việt: Upload nhiều file. Gọi uploadSingle cho từng file.
   *   Nếu bất kỳ file nào thất bại, rollback các file đã upload rồi ném lỗi.
   */
  async uploadMultiple(
    files: UploadFileInput[],
    category: UploadCategory,
    allowedMimeTypes?: string[],
    maxSize: number = DEFAULT_MAX_FILE_SIZE,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadSingle(file, category, allowedMimeTypes, maxSize);
        results.push(result);
      } catch (error) {
        // 한국어: 실패 시 이미 업로드된 파일 롤백
        // Tiếng Việt: Rollback các file đã upload khi thất bại
        await this.rollback(results.map((r) => r.key));
        throw error;
      }
    }

    return results;
  }

  /**
   * 한국어: 업로드된 파일을 일괄 삭제한다 (롤백용).
   *   부모 비즈니스 작업이 실패했을 때 호출하여 orphan 파일을 방지한다.
   * Tiếng Việt: Xóa hàng loạt file đã upload (dùng cho rollback).
   *   Gọi khi thao tác nghiệp vụ cha thất bại để tránh file orphan.
   */
  async rollback(keys: string[]): Promise<void> {
    this.logger.warn(`Rolling back ${keys.length} uploaded file(s)`);
    const deletePromises = keys.map((key) =>
      this.storage.delete(key).catch((err) => {
        // 한국어: 롤백 중 개별 삭제 실패는 로깅만 하고 계속 진행
        // Tiếng Việt: Ghi log lỗi xóa riêng lẻ trong quá trình rollback và tiếp tục
        this.logger.error(`Rollback delete failed for key=${key}`, err);
      }),
    );
    await Promise.all(deletePromises);
  }

  /**
   * 한국어: 단일 파일 삭제.
   * Tiếng Việt: Xóa file đơn.
   */
  async deleteSingle(key: string): Promise<void> {
    await this.storage.delete(key);
  }

  /**
   * 한국어: 파일 유효성 검증 (MIME 타입, 크기).
   * Tiếng Việt: Kiểm tra tính hợp lệ file (MIME type, kích thước).
   */
  private validateFile(
    file: UploadFileInput,
    category: UploadCategory,
    allowedMimeTypes?: string[],
    maxSize: number = DEFAULT_MAX_FILE_SIZE,
  ): void {
    // 한국어: 파일 크기 검증
    // Tiếng Việt: Kiểm tra kích thước file
    if (file.buffer.length > maxSize) {
      throw new DomainError({
        code: ErrorCode.VALIDATION_ERROR,
        params: {
          field: 'file',
          reason: `File size ${file.buffer.length} exceeds maximum ${maxSize} bytes`,
        },
        details: {
          originalName: file.originalName,
          size: file.buffer.length,
          maxSize,
        },
      });
    }

    // 한국어: MIME 타입 검증 — IMAGE 카테고리는 기본 이미지 MIME만 허용
    // Tiếng Việt: Kiểm tra MIME type — category IMAGE chỉ cho phép MIME ảnh mặc định
    const effectiveAllowed =
      allowedMimeTypes ??
      (category === 'IMAGE' ? [...IMAGE_ALLOWED_MIMES] : undefined);

    if (effectiveAllowed && !effectiveAllowed.includes(file.mimeType)) {
      throw new DomainError({
        code: ErrorCode.VALIDATION_ERROR,
        params: {
          field: 'mimeType',
          reason: `MIME type '${file.mimeType}' is not allowed. Allowed: ${effectiveAllowed.join(', ')}`,
        },
        details: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          allowedMimeTypes: effectiveAllowed,
        },
      });
    }
  }
}
