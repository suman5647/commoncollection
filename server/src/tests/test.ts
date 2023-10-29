//import * as notify from '../platform/notify';
//notify.sendEmailAsync('shiju@blocktech.dk', 'test from CC', 'testing notify using one mail CC');
import { JwtAuthUtil } from '../platform/jwt.operations';
import { CaseOperations } from '../platform/case.operations';
import { ICaseCreate, CaseLocale } from '../data/case';
import { Address } from '../data/common';
// let caseOps = new CaseOperations(undefined, undefined);
// caseOps.init({ email: 'shiju@blocktech.dk', tenantId: 'cc' });
// caseOps.updateCase('206222a3-beb8-41fd-b7c7-a8203296585c', {
//     content: [{
//         title: "Shiju Case1",
//         description: "Shiju Case1"
//     } as CaseLocale],
//     address: {
//         language: "en-us",
//         addressLine1: "No 20, second floor,4th Main Road",
//         place: "Bangalore",
//         city: "Bangalore",
//         pincode: "560061",
//         state: "Karnataka",
//         country: "India",
//         addressLine2: "AGS Layout"
//     } as Address,
//     location: {
//         longitude: 0,
//         latitude: 0
//     },
//     isagent: false,
//     baseCurrency: 'USD',
//     amount: 1010,
//     agentCommission: 0,
//     rating: {},
//     attachments: [{}]
// } as ICaseCreate).then(res => { }).catch(err => { });
export class UserController {
    async Test() {
        let jwtverify: any = await new JwtAuthUtil().verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6ImNjIiwiZW1haWwiOiJzdW5rdW9ta2Fyc2FpLndlbW92ZWlkZWFzQGdtYWlsLmNvbSIsInJvbGUiOiJTdGFuZGFyZCIsImxhbmd1YWdlIjoiZW4tdXMiLCJpYXQiOjE2MDQ5MjQ5MjksImV4cCI6MTYwNDk1MzcyOSwic3ViIjoiZW1haWwiLCJpc3MiOiJjYyIsImF1ZCI6ImNjIiwianRpIjoiNDlmMTk1MTctOTY2NS00OGNlLWIxMzUtNWYzOWM4N2U1ZTJjIn0.EXMFvMjxo0BpUYmHMU1AY_1M51BuLwsQ6pSS2EpvEMk");
        console.log(jwtverify);
    }
}

// content: CaseLocale[];
// address: Address;
// location: GeoLocation;
// isagent: boolean; // false
// baseCurrency: string; // ?, from tenant?
// amount: number;
// agentCommission?: number;
// rating: RatingSummary;
// attachments:CaseDocument[];