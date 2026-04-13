/**
 * 한국어: BigInt 용 class-validator 데코레이터. (P2-4)
 *   class-validator 는 기본적으로 BigInt 비교를 지원하지 않아, 금액 필드(VND 정수)에
 *   @Min / @Max 를 직접 걸 수 없다. 아래 데코레이터는 bigint / number 혼합 입력을 안전하게
 *   처리하며, 음수 금액 / 과도하게 큰 금액을 validation 단계에서 거절한다.
 *
 * Tiếng Việt: Decorator xác thực BigInt — không cho phép giá trị âm / vượt ngưỡng tối đa.
 */
import { registerDecorator, ValidationOptions } from 'class-validator';

function toBigInt(value: unknown): bigint | null {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return BigInt(Math.trunc(value));
  if (typeof value === 'string' && /^-?\d+$/.test(value)) return BigInt(value);
  return null;
}

export function IsBigIntMin(min: bigint, options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isBigIntMin',
      target: target.constructor,
      propertyName,
      options,
      constraints: [min],
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true; // @IsOptional 과 조합
          const n = toBigInt(value);
          return n !== null && n >= min;
        },
        defaultMessage() {
          return `$property must be >= ${min}`;
        },
      },
    });
  };
}

export function IsBigIntMax(max: bigint, options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isBigIntMax',
      target: target.constructor,
      propertyName,
      options,
      constraints: [max],
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true;
          const n = toBigInt(value);
          return n !== null && n <= max;
        },
        defaultMessage() {
          return `$property must be <= ${max}`;
        },
      },
    });
  };
}

/**
 * 한국어: 지갑/거래 금액의 기본 상한. VND 는 1 USD ≈ 25,000 VND 로 1조 VND ≈ 4천만 USD.
 *   과도한 단일 거래를 validation 레이어에서 1차 차단. 비즈니스 로직에서 별도 정책 가능.
 */
export const DEFAULT_MAX_VND_AMOUNT: bigint = 1_000_000_000_000n; // 1조 VND
