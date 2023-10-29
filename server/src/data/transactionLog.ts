import { IModel, ITenantModel, IDocumentModel } from './base';
import { FileTypes, FileModes } from './common';

export interface TransactionLog extends IModel, ITenantModel, IDocumentModel<TransactionLog> {
    tenantId: string;
    caseId: string;
    order: {},
    trnInfo: {}
}