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

import { useState, useCallback, useRef } from 'react';
import type { UploadOptions, UploadProgress, UploadResult } from './uploadTypes.js';
import { uploadFile, rollbackUploadedFiles } from './uploadClient.js';

const INITIAL_PROGRESS: UploadProgress = {
  total: 0,
  completed: 0,
  currentFilePercent: 0,
};

const DEFAULT_BASE_URL = 'http://localhost:4000';

/**
 * 한국어: baseUrl 을 결정한다.
 *   명시적으로 전달된 값이 있으면 그대로 사용하고,
 *   없으면 기본값(http://localhost:4000)을 사용한다.
 *   호출자가 각 앱의 환경변수(NEXT_PUBLIC_CENTRAL_API_HTTP 등)로부터
 *   REST base URL 을 구해서 전달하는 것을 권장한다.
 */
function resolveBaseUrl(explicit?: string): string {
  return explicit ?? DEFAULT_BASE_URL;
}

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

export function useUpload(options: UploadOptions): UseUploadReturn {
  const {
    category,
    baseUrl: explicitBaseUrl,
    getToken,
    maxSize,
    allowedTypes,
    onSuccess,
    onError,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>(INITIAL_PROGRESS);
  const [error, setError] = useState<Error | null>(null);

  /** abort 용 — 컴포넌트 언마운트 시 진행 중인 업로드를 취소할 수 있도록 */
  const abortRef = useRef<AbortController | null>(null);

  const resolvedBaseUrl = resolveBaseUrl(explicitBaseUrl);

  const resolveToken = useCallback(async (): Promise<string | null> => {
    if (!getToken) return null;
    const token = await getToken();
    return token ?? null;
  }, [getToken]);

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      const controller = new AbortController();
      abortRef.current = controller;

      setUploading(true);
      setError(null);
      setProgress({ total: 1, completed: 0, currentFilePercent: 0 });

      try {
        const token = await resolveToken();
        const result = await uploadFile({
          file,
          category,
          baseUrl: resolvedBaseUrl,
          token,
          maxSize,
          allowedTypes,
          onProgress: (percent) =>
            setProgress({ total: 1, completed: 0, currentFilePercent: percent }),
          signal: controller.signal,
        });

        setProgress({ total: 1, completed: 1, currentFilePercent: 100 });
        onSuccess?.(result);
        return result;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error(String(err));
        setError(uploadError);
        onError?.(uploadError);
        throw uploadError;
      } finally {
        setUploading(false);
        abortRef.current = null;
      }
    },
    [category, resolvedBaseUrl, resolveToken, maxSize, allowedTypes, onSuccess, onError],
  );

  const uploadMultiple = useCallback(
    async (files: File[] | FileList): Promise<UploadResult[]> => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return [];

      const controller = new AbortController();
      abortRef.current = controller;

      setUploading(true);
      setError(null);
      setProgress({ total: fileArray.length, completed: 0, currentFilePercent: 0 });

      const results: UploadResult[] = [];

      try {
        const token = await resolveToken();

        for (let i = 0; i < fileArray.length; i++) {
          if (controller.signal.aborted) {
            throw new DOMException('Upload aborted', 'AbortError');
          }

          const result = await uploadFile({
            file: fileArray[i],
            category,
            baseUrl: resolvedBaseUrl,
            token,
            maxSize,
            allowedTypes,
            onProgress: (percent) =>
              setProgress({
                total: fileArray.length,
                completed: i,
                currentFilePercent: percent,
              }),
            signal: controller.signal,
          });

          results.push(result);
          setProgress({
            total: fileArray.length,
            completed: i + 1,
            currentFilePercent: 100,
          });
        }

        onSuccess?.(results);
        return results;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error(String(err));
        setError(uploadError);
        onError?.(uploadError);

        // 일부 성공한 파일이 있으면 자동 롤백하지 않는다.
        // 호출자가 rollback() 을 명시적으로 호출하도록 한다.
        throw uploadError;
      } finally {
        setUploading(false);
        abortRef.current = null;
      }
    },
    [category, resolvedBaseUrl, resolveToken, maxSize, allowedTypes, onSuccess, onError],
  );

  const rollback = useCallback(
    async (keys: string[]): Promise<void> => {
      const token = await resolveToken();
      await rollbackUploadedFiles(keys, resolvedBaseUrl, token);
    },
    [resolvedBaseUrl, resolveToken],
  );

  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setUploading(false);
    setProgress(INITIAL_PROGRESS);
    setError(null);
  }, []);

  return { upload, uploadMultiple, rollback, uploading, progress, error, reset };
}
