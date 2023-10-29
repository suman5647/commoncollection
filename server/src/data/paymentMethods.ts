import { IModel, ITenantModel, IDocumentModel } from './base';


export interface currenciesObj {
    name: string;
    isActive: boolean,
}

export interface paymentMethodsObj {
    name: string;
    isActive: boolean;
    currenciesAccepted: [currenciesObj]
}

export interface paymentMethods extends IModel, ITenantModel, IDocumentModel<paymentMethods> {
    tenantId: string;
    paymentMethods: [paymentMethodsObj],
    addedOn: Date
}