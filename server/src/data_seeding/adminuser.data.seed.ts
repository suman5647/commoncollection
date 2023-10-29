import { AuthProviders, Languages } from '../data/common';
import { AdminUser, RoleTypes, UserAuthProvider, UserLite, UserVerification } from '../data/user';

let user01 = { tenantId: 'cc', email: 'tgm@blocktech.dk', phone: '', language: Languages.US, role: RoleTypes.Admin, basic: { userId: 'tgm@blocktech.dk', firstName: 'Thorkild', lastName: ' Grothe-Møller', profilePhoto: '', language: Languages.US.toString(), } as UserLite, authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'shiju@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true} as UserVerification } as AdminUser;
let user02 = { tenantId: 'cc', email: 'support@blocktech.dk', phone: '', language: Languages.US, role: RoleTypes.Admin, basic: { userId: 'support@blocktech.dk', firstName: 'Supoort', lastName: 'User1', profilePhoto: '', language: Languages.US.toString(), } as UserLite, authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'pavan@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true  } as UserVerification} as AdminUser;


export let data = [
    user01, user02,
];