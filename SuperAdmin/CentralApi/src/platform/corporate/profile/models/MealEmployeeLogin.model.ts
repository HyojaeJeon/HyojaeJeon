/**
 * [KO] MealEmployeeLogin GraphQL 모델
 *      VMealApp 임직원 로그인 응답 페이로드를 정의한다.
 *      accessToken, 인증된 임직원 정보, 지갑 정보를 포함한다.
 *
 * [VI] Model GraphQL MealEmployeeLogin
 *      Dinh nghia payload phan hoi dang nhap nhan vien VMealApp.
 *      Bao gom accessToken, thong tin nhan vien da xac thuc, va thong tin vi.
 */
import { Field, ObjectType } from '@nestjs/graphql';
import { MealEmployeeModel } from './MealEmployee.model';
import { MealWalletModel } from '../../wallet/models/MealWallet.model';

@ObjectType()
export class MealEmployeeLoginPayload {
  /** [KO] JWT 액세스 토큰 / [VI] JWT access token */
  @Field() accessToken!: string;

  /** [KO] 인증된 임직원 정보 / [VI] Thong tin nhan vien da xac thuc */
  @Field(() => MealEmployeeModel) employee!: MealEmployeeModel;

  /** [KO] 임직원 지갑 정보 (없을 수 있음) / [VI] Thong tin vi nhan vien (co the khong co) */
  @Field(() => MealWalletModel, { nullable: true }) wallet?: MealWalletModel | null;
}
