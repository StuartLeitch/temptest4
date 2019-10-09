import {Tenant} from '../../domain/Tenant';
import {TenantId} from '../../domain/TenantId';
import {TenantRepoContract} from '../../repos/contracts/tenantRepoContract';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {GetEntityTenantUsecase} from './getEntityTenant';

const repo = {
  getTenantByPossession: jest.fn(),
  getTenantById: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  save: jest.fn(),
  update: jest.fn()
};

describe('GetEntityTenantUsecase', () => {
  let usecase;
  let mockTenant;
  let request;

  beforeEach(() => {
    usecase = new GetEntityTenantUsecase(repo);
    request = {
      possessionType: 'Invoice',
      possessionId: new UniqueEntityID('invoice-1')
    };

    mockTenant = Tenant.create({name: 'foo'}, new UniqueEntityID('tenant-1'));
  });

  it('should return tenant', async () => {
    repo.getTenantByPossession.mockResolvedValue(mockTenant);

    const result = await usecase.execute(request);

    expect(result.isSuccess).toBeTruthy();
    expect(result.getValue()).toBe(mockTenant);
    expect(repo.getTenantByPossession).toHaveBeenLastCalledWith(
      'Invoice',
      request.possessionId
    );
  });

  it('should return undefined if repo does not find tenant', async () => {
    repo.getTenantByPossession.mockResolvedValue(undefined);

    const result = await usecase.execute(request);

    expect(result.isSuccess).toBeTruthy();
    expect(result.getValue()).toBe(undefined);
    expect(repo.getTenantByPossession).toHaveBeenLastCalledWith(
      'Invoice',
      request.possessionId
    );
  });

  it('should return failed result if repo fails', async () => {
    const error = new Error('DBERrro');
    repo.getTenantByPossession.mockRejectedValue(error);

    const result = await usecase.execute(request);

    expect(result.isSuccess).toBeFalsy();
    expect(result.errorValue()).toBe(error);
    expect(repo.getTenantByPossession).toHaveBeenLastCalledWith(
      'Invoice',
      request.possessionId
    );
  });
});
