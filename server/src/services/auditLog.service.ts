import { ServiceBase } from "./base";
import AuditLogSchema, { AuditLogModel } from "../models/auditLog";
import { AuditLog } from "../data/auditLog";

export class AuditLogSevice extends ServiceBase<AuditLog, AuditLogModel> {
    constructor() {
        super(AuditLogSchema, "auditLog");
    }

    // add extra methods here
    test() { };
}