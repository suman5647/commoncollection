import { IModel, ITenantModel, IDocumentModel } from './base';
import { Address, GeoLocation, Contact, AuthProviders, Currency, Languages } from './common';

export interface TenantLite {
    tenantId: string;
    name: string;
}
export interface Tenant extends TenantLite, IModel, ITenantModel, IDocumentModel<Tenant> {
    tenantId: string;
    name: string;
    businessName: string;
    baseLanguage: Languages;
    baseCurrency: Currency;
    address: Address;
    location: GeoLocation;
    contacts: Contact[];
    authProviders: AuthProviders[];
}