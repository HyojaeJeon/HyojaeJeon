/**
 * 한국어: 파일 저장소 프로바이더 인터페이스.
 *   현재는 로컬 디스크 저장(LocalStorageProvider)만 구현되어 있으며,
 *   향후 Cloudflare Images(이미지) / R2(파일)로 쉽게 전환할 수 있도록
 *   저장, 삭제, URL 조회를 추상화한다.
 *
 *   구현체를 교체하려면 Upload.module.ts 에서 provide 대상만 바꾸면 된다.
 *
 *   카테고리:
 *     - IMAGE: 이미지 파일 (jpeg, png, webp, gif, svg+xml)
 *     - FILE:  일반 파일 (제한 없음 또는 allowedMimeTypes 로 제어)
 *
 * Tiếng Việt: Interface provider lưu trữ file.
 *   Hiện chỉ triển khai lưu trữ cục bộ (LocalStorageProvider),
 *   trừu tượng hóa lưu trữ, xóa, truy vấn URL để dễ dàng chuyển sang
 *   Cloudflare Images (ảnh) / R2 (file) trong tương lai.
 *
 *   Để thay đổi triển khai, chỉ cần đổi provide target trong Upload.module.ts.
 *
 *   Category:
 *     - IMAGE: File ảnh (jpeg, png, webp, gif, svg+xml)
 *     - FILE:  File thông thường (không giới hạn hoặc kiểm soát bằng allowedMimeTypes)
 */

export type UploadCategory = 'IMAGE' | 'FILE';

export interface StorageProviderSaveResult {
  /** 한국어: 저장된 파일의 고유 키 (삭제/조회 시 사용) | Tiếng Việt: Khóa duy nhất của file đã lưu */
  key: string;
  /** 한국어: 클라이언트 접근 URL | Tiếng Việt: URL truy cập từ client */
  url: string;
}

export interface StorageProvider {
  /**
   * 한국어: 파일을 저장하고 고유 키와 접근 URL을 반환한다.
   * Tiếng Việt: Lưu file và trả về khóa duy nhất cùng URL truy cập.
   */
  save(
    file: Buffer,
    originalName: string,
    mimeType: string,
    category: UploadCategory,
  ): Promise<StorageProviderSaveResult>;

  /**
   * 한국어: 저장된 파일을 삭제한다. 파일이 존재하지 않으면 무시한다.
   * Tiếng Việt: Xóa file đã lưu. Bỏ qua nếu file không tồn tại.
   */
  delete(key: string): Promise<void>;

  /**
   * 한국어: 저장된 파일의 접근 URL을 반환한다.
   * Tiếng Việt: Trả về URL truy cập của file đã lưu.
   */
  getUrl(key: string): string;
}

/**
 * 한국어: DI 토큰. Upload.module.ts 에서 provide key 로 사용한다.
 * Tiếng Việt: Token DI. Dùng làm provide key trong Upload.module.ts.
 */
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
