import { Schema } from 'mongoose';
import { IDocumentModel } from '../data/base';
import { Tenant } from '../data/tenant';
import { Currency, Languages } from '../data/common';
import { locationSchema, addressSchema, contactSchema } from './common';

export interface TenantModel extends IDocumentModel<Tenant>, Tenant {
}

var tenantSchema: Schema = new Schema();
tenantSchema.add({
    tenantId: String,
    name: String,
    businessName: String,
    baseLanguage: { type: String, default: Languages.US },
    baseCurrency: { type: String, default: Currency.USD },
    address: { type: addressSchema },
    location: { type: locationSchema },
    contacts: [{ type: contactSchema }],
    authProviders: [{ type: String }]
});

export default tenantSchema;