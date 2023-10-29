import { ServiceBase } from "./base";
import tenantSchema, { TenantModel } from "../models/tenant";
import { Tenant } from "../data/tenant";
import { RepositoryBase } from "../repository/base";

export class TenantService extends ServiceBase<Tenant, TenantModel> {
    constructor() {
        super(tenantSchema, "tenant");
    }

    // add extra methods here
    test() { };
}