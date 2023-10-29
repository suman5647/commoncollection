import { Order, OrderStatus, OrderBreakdown, OrderTransaction } from "../data/order";
import { v1 as uuidv1 } from 'uuid';
import { TenantService } from "../services/tenant.service";
import { UserService } from "../services/user.service";
import { CaseService } from "../services/case.service";
import { OrderService } from "../services/order.service";
import { KYCService } from "../services/kyc.service";
import * as users_data from '../data_seeding/user.data.seed';
import { CaseRatingService, UserRatingService } from "../services/rating.service";
import { TransactionAccount, PaymentTypes, FileTypes, FileModes, Currency, AuthProviders } from "../data/common";
import { CaseDonation } from "data/case";

let tservice: TenantService = new TenantService();
let uservice: UserService = new UserService();
let cservice: CaseService = new CaseService();
let oservice: OrderService = new OrderService();
let kycservice: KYCService = new KYCService();
let ratingservice: CaseRatingService = new CaseRatingService();
let userRatingservice: UserRatingService = new UserRatingService();
async function call() {
    let caseId = '32b4bc0d-ddef-496f-ba6b-a83739c41360';
    let users = users_data.data;

    let benfaUser = users[6];
    let benfiUser = users[1];
    let benfaUserBasic = benfaUser.basic;
    let benfaUserAcc = benfiUser.accounts[0];
    let acase = await cservice.findOne({ caseId: caseId });

    let tenantId = acase.tenantId;
    let orderId = uuidv1();
    let tranId = uuidv1();
    let tranref = uuidv1();
    let caseamount = acase.amount / 2;

    let accountDetails1: TransactionAccount = {
        referenceName: tranref,
        accountHoldername: benfaUser.basic.firstName + ' ' + benfaUser.basic.lastName,
        accountType: benfaUserAcc.accountType,
        kycId: '',
        accountId: benfaUserAcc.accountId,
        currency: ''
    };
    let order1: Order = {
        tenantId: tenantId,
        orderId: orderId,
        caseId: caseId,
        status: OrderStatus.Completed,
        currency: Currency.USD,
        amount: caseamount + (caseamount / 10),
        receiverAccount: accountDetails1,
        breakdown: [{
            name: 'payout',
            amount: (caseamount / 10)
        } as OrderBreakdown, {
            name: 'amount',
            amount: caseamount
        } as OrderBreakdown],
        user: benfaUserBasic,
        transactions: [{
            currency: Currency.INR,
            amount: (caseamount / 10),
            trnReference: uuidv1(),
            trnHash: uuidv1(),
        } as OrderTransaction, {
            currency: Currency.INR,
            amount: caseamount,
            trnReference: uuidv1(),
            trnHash: uuidv1(),
        } as OrderTransaction]
    } as Order;

    let norder = await oservice.create(order1);
    console.log(norder);
    acase.donations[7] = {
        user: benfaUserBasic,
        order: {
            currency: Currency.INR,
            amount: Math.round((Math.random() * (5 - 1)) * 10 + 0),  //j is main for loop value
            status: OrderStatus.Completed,
        },
    } as CaseDonation;
    let updateCase = await cservice.updatePart({ caseId: caseId }, {
        $push:  {
            donations: acase.donations[7]
        }
    })
    console.log('Update the case:', updateCase);
}

call();