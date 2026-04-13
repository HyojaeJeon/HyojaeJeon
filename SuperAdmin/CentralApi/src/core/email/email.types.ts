/**
 * Email service type definitions.
 *
 * EmailOptions: 이메일 발송에 필요한 모든 옵션을 정의합니다.
 * EmailAttachment: 첨부파일 구조를 정의합니다.
 * EmailSendResult: 발송 결과를 반환합니다.
 */

export interface EmailOptions {
  /** Recipient address(es) */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** Handlebars template name (without locale suffix or extension) */
  templateName: string;
  /** Data to inject into the template */
  templateData: Record<string, unknown>;
  /** Recipient locale for template selection — defaults to 'vi' */
  locale?: string;
  /** Optional file attachments */
  attachments?: EmailAttachment[];
  /** CC recipients */
  cc?: string[];
  /** Reply-to address */
  replyTo?: string;
}

export interface EmailAttachment {
  /** Display filename */
  filename: string;
  /** Raw buffer content */
  content?: Buffer;
  /** File path (alternative to content) */
  path?: string;
  /** MIME type */
  contentType?: string;
}

export interface EmailSendResult {
  /** Whether the send operation succeeded */
  success: boolean;
  /** Nodemailer messageId on success */
  messageId?: string;
  /** Error message on failure */
  error?: string;
}

/** Supported template names */
export type EmailTemplateName =
  | 'invoice-issued'
  | 'invoice-review'
  | 'settlement-paid'
  | 'contract-sent'
  | 'contract-signed';

/** Supported locales for email templates */
export type EmailLocale = 'ko' | 'en' | 'vi';

/** Default locale when none specified */
export const DEFAULT_EMAIL_LOCALE: EmailLocale = 'vi';

/** Redis stream key for async email outbox */
export const EMAIL_OUTBOX_STREAM = 'email:outbox';
