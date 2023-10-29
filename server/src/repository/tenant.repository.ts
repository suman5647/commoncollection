import tenantSchema, { TenantModel } from '../models/tenant';
import { Tenant } from '../data/tenant';
import { RepositoryBase } from './base';

export class TenantRepository extends RepositoryBase<TenantModel, Tenant> {
    constructor() {
        super(tenantSchema, "tenant");
    }

    // Add additional repository methods if required
}