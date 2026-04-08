/**
 * 한국어: BigInt validator 단위 테스트. (P2-4)
 *   IsBigIntMin / IsBigIntMax 가 음수 / 0 / 양수 / 과대 / 잘못된 타입을 정확히 처리하는지 검증.
 */
import 'reflect-metadata';
import { validate } from 'class-validator';
import {
  DEFAULT_MAX_VND_AMOUNT,
  IsBigIntMax,
  IsBigIntMin,
} from './bigint-validators';

class Sample {
  @IsBigIntMin(1n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  amount!: bigint;
}

function makeInstance(amount: unknown): Sample {
  const obj = new Sample();
  // bypass typescript guard for negative test
  (obj as unknown as { amount: unknown }).amount = amount;
  return obj;
}

describe('IsBigIntMin / IsBigIntMax', () => {
  it('accepts a valid positive bigint', async () => {
    const errors = await validate(makeInstance(1000n));
    expect(errors).toHaveLength(0);
  });

  it('rejects negative values', async () => {
    const errors = await validate(makeInstance(-1n));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects zero (min is 1)', async () => {
    const errors = await validate(makeInstance(0n));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects values exceeding max', async () => {
    const errors = await validate(makeInstance(DEFAULT_MAX_VND_AMOUNT + 1n));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts numeric input by coercion', async () => {
    const errors = await validate(makeInstance(1500));
    expect(errors).toHaveLength(0);
  });

  it('accepts numeric string by coercion', async () => {
    const errors = await validate(makeInstance('1500'));
    expect(errors).toHaveLength(0);
  });

  it('rejects non-numeric string', async () => {
    const errors = await validate(makeInstance('abc'));
    expect(errors.length).toBeGreaterThan(0);
  });
});
