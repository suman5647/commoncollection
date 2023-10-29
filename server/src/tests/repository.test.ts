import { AuthProviders, Contact, ContactTypes, Address, GeoLocation, Currency, Languages, PaymentTypes, FileTypes, FileModes, CryptoAccount } from "../data/common";
import { Tenant } from "../data/tenant";
import { User, RoleTypes, UserVerification, UserAuthProvider, UserLite } from "../data/user";
import { Case, CaseStatus } from "../data/case";
import { Order } from "../data/order";
import { TenantService } from "../services/tenant.service";
import { UserService } from "../services/user.service";
import { CaseService } from "../services/case.service";
import { OrderService } from "../services/order.service";
import { v1 as uuidv1 } from 'uuid';

// let newTenant: Tenant = {
//     tenantId: 'cc', name: 'Common Collection', businessName: 'Common Collection', baseLanguage: Languages.DK, baseCurrency: Currency.DKK,
//     address: { addressLine1: '#20', addressLine2: 'AGS Layout', city: 'Bangalore', country: 'India', language: Languages.US, pincode: '560061', place: 'Banashankari', state: 'Karnataka' } as Address,
//     authProviders: [AuthProviders.Facebook, AuthProviders.Google, AuthProviders.Local],
//     location: { latitude: 12.9322672, longitude: 77.5121184 } as GeoLocation,
//     contacts: [{ contactType: ContactTypes.Business, email: 'shiju@blocktech.dk', firstName: 'Shiju', lastName: 'Madamchery', phone: '919686622751' } as Contact],
// } as Tenant;

// let tservice: TenantService = new TenantService();
// tservice.test();

// let newUser: User = { tenantId: 'CC', email: 'om@blocktech.dk', phone: '9686622751', language: Languages.US, role: RoleTypes.Standard, basic: { userId: 'om@blocktech.dk', firstName: 'Omkar', lastName: 'Sai Sunku', profilePhoto: 'omkar_profile_photo', language: Languages.US.toString(), } as UserLite, authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'om@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true, phoneVerified: true } as UserVerification, accounts: [{ accountId: 'QjYjsYmmuWPhYxt8hGjKx3cRH841rNv7w1', accountType: PaymentTypes.BTC } as CryptoAccount] } as User;

// let uservice: UserService = new UserService();

// let newCase: Case = {
//     tenantId: 'CC',
//     caseId: uuidv1(),
//     revision: 1,
//     isagent: true,
//     isactive: true,
//     content: [{
//         lang: Languages.US,
//         title: 'Help for Poor',
//         description: 'Poor needed some money due to floods at the village'
//     }],
//     address: { addressLine1: 'Outskirts', addressLine2: 'Halli', city: 'Bangalore', country: 'India', language: Languages.US, pincode: '560099', place: 'Yelanaka', state: 'Karnataka' },
//     location: { latitude: 12.9322672, longitude: 77.5121184 },
//     status: CaseStatus.Draft,
//     agetcommission: 0.05,
//     agetcommissionPercent: 10,
//     baseCurrency: 'INR',
//     accountDetails: [],
//     attachments: [{
//         fileType: FileTypes.ImageJpg,
//         fileMode: FileModes.Standard,
//         title: 'PHOTOS OF POOR',
//         uniqueName: 'PICTURES DUES TO FLOODS',
//     }],
//     beneficiary: { userId: '123', firstName: 'Sunku', lastName: 'Omkar', profilePhoto: 'my pic from fb ulr', language: 'en' },
//     donations: [{
//         user: { userId: '123', firstName: 'Sunku', lastName: 'Omkar', profilePhoto: 'my pic from fb ulr', language: 'en' },
//         order: { currency: 'INR', amount: 150 }
//     }],
//     rating: {
//         count: 20,
//         recentUpdate: new Date(),
//         average: 7.5
//     },
//     reportAbuse: {
//         count: 8,
//         recentUpdate: new Date()
//     },
//     category: ['Poor Help'],
//     tags: ['poor', 'help', 'floods', 'Bnagalore', 'India'],
// } as Case;

let cservice: CaseService = new CaseService();

// let newOrder: Order = {
//     tenantId: 'CC',
//     orderId: '1234',
//     caseId: '123456',
//     currency: 'INR',
//     amount: 3000,
//     breakdown: [{
//         name: 'INR DONATE',
//         amount: 5000
//     }],
//     user: { userId: '123', firstName: 'Sunku', lastName: 'Omkar', profilePhoto: 'my pic from fb ulr', language: 'en' },
//     transactions: [{
//         currency: 'INR',
//         amount: 300,
//         trnReference: 'SBI BANK ON 27-06-2019 8PM',
//         trnHash: '182O38003289'
//     }]
// } as Order;

// let oservice: OrderService = new OrderService();

// // CREATE TENANT
// tservice.create(newTenant).then(nt => {
//     console.log('tenant created:');
//     console.log(nt);

//     // FIND TENANT
//     tservice.findOne({ tenantId: 'cc' }).then(qt => {
//         console.log('query result:');
//         console.log(qt);

//         // UPDATE
//         qt.baseLanguage = Languages.US;
//         tservice.updateOne(qt['_id'].toString(), qt).then(uqt => {
//             console.log('updated :');
//             console.log(uqt);
//         }).catch(err => {
//             console.log(err);
//         });

//     }).catch(err => {
//         console.log(err);
//     });
// }).catch(err => {
//     console.log(err);
// });

// // CREATE USER
// uservice.create(newUser).then(user => {
//     console.log('user created:');
//     console.log(user);

//     // FIND USER
//     uservice.findOne({ email: 'sunkuomkarsai@gmail.com' }).then(qt => {
//         console.log('query result:');
//         console.log(qt);
//     }).catch(err => {
//         console.log(err);
//     });


// }).catch(err => {
//     console.log(err);
// });

//CREATE CASE
// cservice.create(newCase).then(cas1 => {
//     console.log('Case created');
//     console.log(cas1);

//     // FIND CASE
//     // uservice.findOne({ caseId: '123' }).then(qt => {
//     //     console.log('query result:');
//     //     console.log(qt);
//     // }).catch(err => {
//     //     console.log(err);
//     // });
// }).catch(err => {
//     console.log(err);
// });

// donations: [{
//         user: { userId: '123', firstName: 'Sunku', lastName: 'Omkar', profilePhoto: 'my pic from fb ulr', language: 'en' },
//         order: { currency: 'INR', amount: 150 }
//     }]


//Update case donations
cservice.updatePart({caseId: 'bangalore-case0001'}, { $push: { donations: {
     user: { userId: 'om@blocktech.dk', firstName: 'Sai', lastName: 'Omkar Sunku', profilePhoto: 'my pic from fb ulr', language: 'en' },
        order: { currency: 'USD', amount: 12, status: "Completed" }} } }).then(cas=> {
   console.log(cas);
}).catch(err => {
    console.log(err);
});

//add more attachments
// cservice.updatePart({ caseId: 125 }, {
//     $push: {
//         attachments: {
//             fileType: FileTypes.ImageJpg,
//             fileMode: FileModes.Standard,
//             title: 'PHOTOS OF POOR',
//             uniqueName: 'PICTURES DUES TO FLOODS-3',
//         }
//     }
// }).then(cas => {
//     console.log(cas);
// }).catch(err => {
//     console.log(err);
// });

// CREATE ORDER
// oservice.create(newOrder).then(order=>{
//     console.log('order created:');
//     console.log(order);

//     // FIND ORDER
//     tservice.findOne({ orderId: '1234' }).then(qt => {
//         console.log('query result:');
//         console.log(qt);
//     }).catch(err => {
//         console.log(err);
//     });
// }).catch(err => {
//     console.log(err);
// });
