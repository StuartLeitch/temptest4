import {Repo} from '../../../../infrastructure/Repo';
import {Tenant} from '../../domain/Tenant';
import {TenantId} from '../../domain/TenantId';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

export interface TenantRepoContract extends Repo<Tenant> {
  getTenantById(tenantId: TenantId): Promise<Tenant>;
  getTenantByPossession(
    possessionType: string,
    possessionId: UniqueEntityID
  ): Promise<Tenant>;
  delete(tenant: Tenant): Promise<unknown>;
  update(tenant: Tenant): Promise<Tenant>;
}
