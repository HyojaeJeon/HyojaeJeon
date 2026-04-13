/**
 * 한국어:
 *   파일/이미지 업로드 공용 타입 정의.
 *   모든 웹 플랫폼(SuperAdmin Portal, CorporatePortal, BrandAdminPortal)에서 동일하게 사용한다.
 *
 * Tieng Viet:
 *   Dinh nghia kieu upload file/anh dung chung.
 *   Su dung giong nhau tren tat ca nen tang web.
 */
export type UploadCategory = 'IMAGE' | 'FILE';
export interface UploadResult {
    key: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
}
export interface UploadOptions {
    /** 업로드 카테고리: 이미지 또는 일반 파일 */
    category: UploadCategory;
    /** CentralApi REST base URL (기본: NEXT_PUBLIC_CENTRAL_API_HTTP 에서 /graphql 을 제거한 값) */
    baseUrl?: string;
    /** 인증 토큰 반환 함수 (async 가능) */
    getToken?: () => string | null | Promise<string | null>;
    /** 최대 파일 크기 (bytes, 기본 10MB) */
    maxSize?: number;
    /** 허용 MIME 타입 (예: ['image/jpeg', 'image/png']) */
    allowedTypes?: string[];
    /** 업로드 성공 콜백 */
    onSuccess?: (result: UploadResult | UploadResult[]) => void;
    /** 업로드 실패 콜백 */
    onError?: (error: Error) => void;
}
export interface UploadProgress {
    /** 전체 파일 수 */
    total: number;
    /** 완료된 파일 수 */
    completed: number;
    /** 현재 업로드 중인 파일의 진행률 (0-100) */
    currentFilePercent: number;
}
export interface UploadState {
    uploading: boolean;
    progress: UploadProgress;
    error: Error | null;
}
