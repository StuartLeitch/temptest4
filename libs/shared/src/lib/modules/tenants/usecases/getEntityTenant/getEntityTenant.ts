import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Tenant} from '../../domain/Tenant';
import {TenantRepoContract} from '../../repos/contracts/tenantRepoContract';
import {TenantId} from '../../domain/TenantId';

export interface GetEntityTenantRequestDTO {
  possessionType: string;
  possessionId: UniqueEntityID;
}

export type GetEntityTenantContext = typeof undefined;

export class GetEntityTenantUsecase
  implements
    UseCase<
      GetEntityTenantRequestDTO,
      Result<TenantId>,
      GetEntityTenantContext
    > {
  constructor(private tenantRepo: TenantRepoContract) {}

  public async execute(
    request: GetEntityTenantRequestDTO,
    context?: GetEntityTenantContext
  ): Promise<Result<Tenant>> {
    let tenant;
    try {
      tenant = await this.tenantRepo.getTenantByPossession(
        request.possessionType,
        request.possessionId
      );
    } catch (e) {
      return Result.fail(e);
    }

    return Result.ok(tenant);
  }
}
