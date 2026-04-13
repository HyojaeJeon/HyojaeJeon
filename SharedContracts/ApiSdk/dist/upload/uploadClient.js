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
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export class UploadValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UploadValidationError';
    }
}
export class UploadApiError extends Error {
    statusCode;
    responseBody;
    constructor(message, statusCode, responseBody) {
        super(message);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
        this.name = 'UploadApiError';
    }
}
/**
 * 한국어: 파일 유효성 검사 (크기, MIME 타입).
 */
function validateFile(file, maxSize, allowedTypes) {
    if (file.size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
        throw new UploadValidationError(`File "${file.name}" exceeds maximum size of ${maxMB}MB (actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
    }
    if (allowedTypes?.length && !allowedTypes.includes(file.type)) {
        throw new UploadValidationError(`File "${file.name}" has disallowed type "${file.type}". Allowed: ${allowedTypes.join(', ')}`);
    }
}
/**
 * 한국어: 단일 파일을 CentralApi REST 엔드포인트에 업로드한다.
 *   XMLHttpRequest 를 사용하여 업로드 진행률을 추적한다.
 *
 * Tieng Viet: Upload mot file len CentralApi REST endpoint.
 *   Dung XMLHttpRequest de theo doi tien trinh upload.
 */
export function uploadFile(params) {
    const { file, category, baseUrl, token, maxSize = DEFAULT_MAX_SIZE, allowedTypes, onProgress, signal, } = params;
    validateFile(file, maxSize, allowedTypes);
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        const xhr = new XMLHttpRequest();
        const url = `${baseUrl}/api/v1/uploads`;
        xhr.open('POST', url);
        xhr.withCredentials = true;
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        // AbortSignal 연동
        if (signal) {
            if (signal.aborted) {
                reject(new DOMException('Upload aborted', 'AbortError'));
                return;
            }
            signal.addEventListener('abort', () => xhr.abort(), { once: true });
        }
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        });
        xhr.addEventListener('load', () => {
            try {
                const body = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    // CentralApi REST 표준 응답: { success: { data: UploadResult } }
                    const data = body?.success?.data ?? body?.data ?? body;
                    resolve(data);
                }
                else {
                    const message = body?.error?.message ?? body?.message ?? `Upload failed with status ${xhr.status}`;
                    reject(new UploadApiError(message, xhr.status, body));
                }
            }
            catch {
                reject(new UploadApiError(`Upload failed with status ${xhr.status}`, xhr.status));
            }
        });
        xhr.addEventListener('error', () => {
            reject(new UploadApiError('Network error during upload', 0));
        });
        xhr.addEventListener('abort', () => {
            reject(new DOMException('Upload aborted', 'AbortError'));
        });
        xhr.send(formData);
    });
}
/**
 * 한국어: 업로드된 파일 키 목록을 서버에 삭제 요청한다 (롤백).
 *   후속 작업(예: DB 저장)이 실패했을 때 이미 업로드된 파일을 정리하는 용도.
 *
 * Tieng Viet: Xoa cac file da upload (rollback) khi thao tac tiep theo that bai.
 */
export async function rollbackUploadedFiles(keys, baseUrl, token) {
    if (keys.length === 0)
        return;
    const response = await fetch(`${baseUrl}/api/v1/uploads`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ keys }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new UploadApiError(body?.error?.message ?? `Rollback failed with status ${response.status}`, response.status, body);
    }
}
