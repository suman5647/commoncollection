import { Document } from 'mongoose';

export interface IModel {
}
export interface ITenantModel {
    tenantId: string;
}

export interface IDocumentModel<T extends IModel> extends Document, IModel {
}