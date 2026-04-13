/**
 * 한국어:
 *   프레임워크 무관 업로드 클라이언트.
 *   CentralApi REST 엔드포인트(POST /api/v1/uploads, DELETE /api/v1/uploads)에 대한
 *   파일 업로드 / 롤백 로직을 구현한다. React 의존성 없이 순수 fetch 기반이다.
 *
 * Tieng Viet:
 *   Upload client khong phu thuoc framework.
 *   Upload / rollback thong qua CentralApi REST endpoint, chi dung fetch thuan.
 */
import type { UploadCategory, UploadResult } from './uploadTypes.js';
export declare class UploadValidationError extends Error {
    constructor(message: string);
}
export declare class UploadApiError extends Error {
    readonly statusCode: number;
    readonly responseBody?: unknown | undefined;
    constructor(message: string, statusCode: number, responseBody?: unknown | undefined);
}
export interface UploadFileParams {
    file: File;
    category: UploadCategory;
    baseUrl: string;
    token: string | null;
    maxSize?: number;
    allowedTypes?: string[];
    /** XMLHttpRequest progress 콜백 (0-100). fetch 는 upload progress 를 지원하지 않으므로 XHR 사용. */
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
}
/**
 * 한국어: 단일 파일을 CentralApi REST 엔드포인트에 업로드한다.
 *   XMLHttpRequest 를 사용하여 업로드 진행률을 추적한다.
 *
 * Tieng Viet: Upload mot file len CentralApi REST endpoint.
 *   Dung XMLHttpRequest de theo doi tien trinh upload.
 */
export declare function uploadFile(params: UploadFileParams): Promise<UploadResult>;
/**
 * 한국어: 업로드된 파일 키 목록을 서버에 삭제 요청한다 (롤백).
 *   후속 작업(예: DB 저장)이 실패했을 때 이미 업로드된 파일을 정리하는 용도.
 *
 * Tieng Viet: Xoa cac file da upload (rollback) khi thao tac tiep theo that bai.
 */
export declare function rollbackUploadedFiles(keys: string[], baseUrl: string, token: string | null): Promise<void>;
