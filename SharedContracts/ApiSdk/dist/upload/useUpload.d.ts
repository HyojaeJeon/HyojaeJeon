/**
 * 한국어:
 *   파일/이미지 업로드 공용 훅.
 *   모든 웹 플랫폼(SuperAdmin Portal, CorporatePortal, BrandAdminPortal)에서 동일하게 사용한다.
 *
 *   사용법:
 *   ```tsx
 *   import { useUpload } from '@platform/api-sdk';
 *   import { getAccessToken } from '@auth/session';
 *
 *   const { upload, uploadMultiple, rollback, uploading, progress, error, reset } = useUpload({
 *     category: 'IMAGE',
 *     maxSize: 5 * 1024 * 1024,
 *     allowedTypes: ['image/jpeg', 'image/png'],
 *     getToken: () => getAccessToken(),
 *     onSuccess: (result) => console.log('Uploaded:', result),
 *     onError: (err) => console.error('Failed:', err),
 *   });
 *
 *   // 단일 업로드
 *   const result = await upload(file);
 *   // result = { key: 'images/abc-123.jpg', url: '/api/v1/uploads/images/abc-123.jpg', originalName: 'photo.jpg', mimeType: 'image/jpeg', size: 123456 }
 *
 *   // 다중 업로드
 *   const results = await uploadMultiple(fileList);
 *
 *   // 롤백 (업로드 성공 후 후속 작업 실패 시)
 *   await rollback(results.map(r => r.key));
 *   ```
 *
 * Tieng Viet:
 *   Hook upload file/anh dung chung.
 *   Su dung giong nhau tren tat ca nen tang web (SuperAdmin Portal, CorporatePortal, BrandAdminPortal).
 *
 *   Cach dung:
 *   ```tsx
 *   import { useUpload } from '@platform/api-sdk';
 *   import { getAccessToken } from '@auth/session';
 *
 *   const { upload, uploadMultiple, rollback, uploading, progress, error, reset } = useUpload({
 *     category: 'IMAGE',
 *     getToken: () => getAccessToken(),
 *   });
 *   ```
 */
import type { UploadOptions, UploadProgress, UploadResult } from './uploadTypes.js';
export interface UseUploadReturn {
    /** 단일 파일 업로드 */
    upload: (file: File) => Promise<UploadResult>;
    /** 다중 파일 업로드 (순차 실행) */
    uploadMultiple: (files: File[] | FileList) => Promise<UploadResult[]>;
    /** 업로드된 파일 롤백 (키 목록으로 삭제) */
    rollback: (keys: string[]) => Promise<void>;
    /** 업로드 진행 중 여부 */
    uploading: boolean;
    /** 업로드 진행 상황 */
    progress: UploadProgress;
    /** 마지막 에러 */
    error: Error | null;
    /** 에러 및 진행 상태 초기화 */
    reset: () => void;
}
export declare function useUpload(options: UploadOptions): UseUploadReturn;
