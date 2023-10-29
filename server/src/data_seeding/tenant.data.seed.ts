import { Tenant } from '../data/tenant';
import { Address, GeoLocation, Contact, ContactTypes, AuthProviders, Currency, Languages } from '../data/common';

let t1 = {
    tenantId: 'cc',
    name: 'CC',
    businessName: 'CommonCollection',
    baseLanguage: Languages.US,
    baseCurrency: Currency.USD,
    address: {
        contactType: ContactTypes.Default,
        language: Languages.US,
        addressLine1: '7, 1411 København',
        addressLine2: '',
        country: 'Denmark',
        state: 'Copenhagen',
        city: 'Copenhagen',
        place: 'Copenhagen Municipality',
        pincode: '1411'
    } as Address,
    location: { longitude: 12.585392, latitude: 55.671119 } as GeoLocation,
    contacts: [{
        contactType: ContactTypes.Default,
        firstName: 'Thorkild',
        lastName: 'Grothe-Møller',
        phone: '+45 25853002',
        email: 'contact@blocktech.dk'
    } as Contact] as Contact[],
    authProviders: [AuthProviders.Local, AuthProviders.Facebook, AuthProviders.Google],
} as Tenant;

export let data = [t1];
