/**
 * 한국어: 파일 업로드 REST 컨트롤러.
 *   설계 기준상 CentralApi 에서만 REST 예외가 허용되며, 파일 업로드는
 *   multipart/form-data 특성상 REST 가 적합하다 (GraphQL-first 예외).
 *
 *   엔드포인트:
 *     POST   /api/v1/uploads/image     — 단일 이미지 업로드 (field: "file")
 *     POST   /api/v1/uploads/images    — 다중 이미지 업로드 (field: "files")
 *     POST   /api/v1/uploads/file      — 단일 파일 업로드 (field: "file")
 *     POST   /api/v1/uploads/files     — 다중 파일 업로드 (field: "files")
 *     GET    /api/v1/uploads/:category/:filename — 업로드된 파일 서빙
 *     DELETE /api/v1/uploads/:category/:filename — 업로드된 파일 삭제
 *
 *   인증: 글로벌 GqlAuthGuard(APP_GUARD) 가 JWT 를 검증한다.
 *         GET (파일 서빙)은 @Public() 으로 인증 없이 접근 가능.
 *
 *   Fastify multipart:
 *     - 단일: request.file()
 *     - 다중: request.files()
 *
 * Tiếng Việt: Controller REST upload file.
 *   Theo tiêu chuẩn thiết kế, chỉ CentralApi được phép ngoại lệ REST,
 *   và upload file phù hợp với REST do đặc tính multipart/form-data (ngoại lệ GraphQL-first).
 *
 *   Endpoints:
 *     POST   /api/v1/uploads/image     — Upload ảnh đơn (field: "file")
 *     POST   /api/v1/uploads/images    — Upload nhiều ảnh (field: "files")
 *     POST   /api/v1/uploads/file      — Upload file đơn (field: "file")
 *     POST   /api/v1/uploads/files     — Upload nhiều file (field: "files")
 *     GET    /api/v1/uploads/:category/:filename — Phục vụ file đã upload
 *     DELETE /api/v1/uploads/:category/:filename — Xóa file đã upload
 *
 *   Xác thực: GqlAuthGuard toàn cục (APP_GUARD) xác minh JWT.
 *             GET (phục vụ file) dùng @Public() để truy cập không cần xác thực.
 */
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { join, extname } from 'node:path';

import { Public } from '@core/auth/decorators/Public.decorator';
import { DomainError } from '@core/errors/DomainError';
import { ErrorCode } from '@core/errors/errorCodes';
import { buildRestSuccess } from '@core/response/restResponse';
import { UploadService, type UploadFileInput } from './Upload.service';

/**
 * 한국어: 허용되는 category 파라미터 값. path traversal 방지용.
 * Tiếng Việt: Giá trị category parameter được phép. Dùng để ngăn path traversal.
 */
const ALLOWED_CATEGORIES = new Set(['images', 'files']);

/**
 * 한국어: 파일명 허용 패턴. UUID-timestamp.ext 형식만 허용하여 path traversal 차단.
 * Tiếng Việt: Pattern tên file được phép. Chỉ cho phép dạng UUID-timestamp.ext để chặn path traversal.
 */
const SAFE_FILENAME_PATTERN = /^[a-f0-9-]+\.[a-z0-9]+$/i;

/**
 * 한국어: 확장자 → MIME 타입 매핑 (외부 의존성 없이 기본 타입 지원).
 * Tiếng Việt: Mapping extension → MIME type (hỗ trợ type cơ bản mà không cần dependency ngoài).
 */
const EXT_MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.xml': 'application/xml',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function lookupMime(filename: string): string {
  const ext = extname(filename).toLowerCase();
  return EXT_MIME_MAP[ext] ?? 'application/octet-stream';
}

@Controller('uploads')
export class UploadController {
  private readonly uploadsDir: string;

  constructor(private readonly uploadService: UploadService) {
    this.uploadsDir = join(process.cwd(), 'uploads');
  }

  /**
   * 한국어: POST /api/v1/uploads/image — 단일 이미지 업로드.
   *   Fastify multipart 의 request.file() 로 단일 파일을 읽는다.
   * Tiếng Việt: POST /api/v1/uploads/image — Upload ảnh đơn.
   *   Đọc file đơn bằng request.file() của Fastify multipart.
   */
  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(@Req() req: FastifyRequest) {
    const data = await req.file();
    if (!data) {
      throw new DomainError({
        code: ErrorCode.VALIDATION_ERROR,
        params: { field: 'file', reason: 'No file provided' },
      });
    }

    const fileInput = await this.toFileInput(data);
    const result = await this.uploadService.uploadSingle(fileInput, 'IMAGE');
    return buildRestSuccess(req, result, { code: 'CREATED' });
  }

  /**
   * 한국어: POST /api/v1/uploads/images — 다중 이미지 업로드.
   *   Fastify multipart 의 request.files() 로 다중 파일을 읽는다.
   * Tiếng Việt: POST /api/v1/uploads/images — Upload nhiều ảnh.
   *   Đọc nhiều file bằng request.files() của Fastify multipart.
   */
  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  async uploadImages(@Req() req: FastifyRequest) {
    const parts = req.files();
    const fileInputs: UploadFileInput[] = [];

    for await (const part of parts) {
      fileInputs.push(await this.toFileInput(part));
    }

    if (fileInputs.length === 0) {
      throw new DomainError({
        code: ErrorCode.VALIDATION_ERROR,
        params: { field: 'files', reason: 'No files provided' },
      });
    }

    const results = await this.uploadService.uploadMultiple(fileInputs, 'IMAGE');
    return buildRestSuccess(req, results, { code: 'CREATED' });
  }

  /**
   * 한국어: POST /api/v1/uploads/file — 단일 파일 업로드.
   * Tiếng Việt: POST /api/v1/uploads/file — Upload file đơn.
   */
  @Post('file')
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(@Req() req: FastifyRequest) {
    const data = await req.file();
    if (!data) {
      throw new DomainError({
        code: ErrorCode.VALIDATION_ERROR,
        params: { field: 'file', reason: 'No file provided' },
      });
    }

    const fileInput = await this.toFileInput(data);
    const result = await this.uploadService.uploadSingle(fileInput, 'FILE');
    return buildRestSuccess(req, result, { code: 'CREATED' });
  }

  /**
   * 한국어: POST /api/v1/uploads/files — 다중 파일 업로드.
   * Tiếng Việt: POST /api/v1/uploads/files — Upload nhiều file.
   */
  @Post('files')
  @HttpCode(HttpStatus.CREATED)
  async uploadFiles(@Req() req: FastifyRequest) {
    const parts = req.files();
    const fileInputs: UploadFileInput[] = [];

    for await (const part of parts) {
      fileInputs.push(await this.toFileInput(part));
    }

    if (fileInputs.length === 0) {
      throw new DomainError({
        code: ErrorCode.VALIDATION_ERROR,
        params: { field: 'files', reason: 'No files provided' },
      });
    }

    const results = await this.uploadService.uploadMultiple(fileInputs, 'FILE');
    return buildRestSuccess(req, results, { code: 'CREATED' });
  }

  /**
   * 한국어: GET /api/v1/uploads/:category/:filename — 업로드된 파일 서빙.
   *   인증 없이 접근 가능 (@Public). path traversal 을 방지한다.
   * Tiếng Việt: GET /api/v1/uploads/:category/:filename — Phục vụ file đã upload.
   *   Truy cập không cần xác thực (@Public). Ngăn chặn path traversal.
   */
  @Public()
  @Get(':category/:filename')
  async serveFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res() reply: FastifyReply,
  ) {
    // 한국어: path traversal 방지 — category 와 filename 을 화이트리스트로 검증
    // Tiếng Việt: Ngăn path traversal — kiểm tra category và filename bằng whitelist
    if (!ALLOWED_CATEGORIES.has(category)) {
      throw new DomainError({
        code: ErrorCode.NOT_FOUND,
        params: { resource: 'file' },
      });
    }

    if (!SAFE_FILENAME_PATTERN.test(filename)) {
      throw new DomainError({
        code: ErrorCode.NOT_FOUND,
        params: { resource: 'file' },
      });
    }

    const filePath = join(this.uploadsDir, category, filename);

    try {
      await access(filePath);
    } catch {
      throw new DomainError({
        code: ErrorCode.NOT_FOUND,
        params: { resource: 'file' },
      });
    }

    // 한국어: Content-Type 추론 후 파일 스트리밍
    // Tiếng Việt: Suy luận Content-Type rồi stream file
    const mimeType = lookupMime(filename);
    const stream = createReadStream(filePath);
    return reply.type(mimeType).send(stream);
  }

  /**
   * 한국어: DELETE /api/v1/uploads/:category/:filename — 업로드된 파일 삭제.
   * Tiếng Việt: DELETE /api/v1/uploads/:category/:filename — Xóa file đã upload.
   */
  @Delete(':category/:filename')
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Req() req: FastifyRequest,
  ) {
    if (!ALLOWED_CATEGORIES.has(category)) {
      throw new DomainError({
        code: ErrorCode.NOT_FOUND,
        params: { resource: 'file' },
      });
    }

    if (!SAFE_FILENAME_PATTERN.test(filename)) {
      throw new DomainError({
        code: ErrorCode.NOT_FOUND,
        params: { resource: 'file' },
      });
    }

    const key = `${category}/${filename}`;
    await this.uploadService.deleteSingle(key);

    return buildRestSuccess(req, { key, deleted: true });
  }

  /**
   * 한국어: Fastify multipart part 를 UploadFileInput 으로 변환한다.
   *   part.toBuffer() 로 전체 내용을 메모리에 로드한다.
   * Tiếng Việt: Chuyển đổi Fastify multipart part thành UploadFileInput.
   *   Dùng part.toBuffer() để tải toàn bộ nội dung vào bộ nhớ.
   */
  private async toFileInput(part: {
    filename: string;
    mimetype: string;
    toBuffer: () => Promise<Buffer>;
  }): Promise<UploadFileInput> {
    const buffer = await part.toBuffer();
    return {
      buffer,
      originalName: part.filename,
      mimeType: part.mimetype,
    };
  }
}
