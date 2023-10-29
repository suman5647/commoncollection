import { IModel, ITenantModel, IDocumentModel } from './base';

export interface AuditLog extends IModel, ITenantModel, IDocumentModel<AuditLog> {
    source: string;
    userId: string; //system id or user id who called a third service
    orderId: string;
    status: number; //response status
    message: object; //response from third party
    created: Date
}