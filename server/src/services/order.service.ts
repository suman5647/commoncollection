import { AuditData } from '../config/common';
import { Order, OrderStatus, OrderTransaction, RatesSet } from '../data/order';
import orderSchema, { OrderModel } from '../models/order';
import { AuditLogSevice } from '../services/auditLog.service';
import { CaseService } from '../services/case.service';
import { emailSendService } from '../services/email.service';
import { ExchangeRatesSerivce } from '../services/exchangeRates.service';
import { UserService } from '../services/user.service';
import { ServiceBase } from './base';

const exchange: ExchangeRatesSerivce = new ExchangeRatesSerivce();
const cservice: CaseService = new CaseService();
const uservice: UserService = new UserService();
const emailService: emailSendService = new emailSendService();
const auditLog: AuditLogSevice = new AuditLogSevice();

export class OrderService extends ServiceBase<Order, OrderModel> {
    constructor() {
        super(orderSchema, "order");
    }

    // add extra methods here
    test() { };

    async updatePayoutOrder(orderDetails, adminLite, payoutTx) {
        try {
            //person who is donating
            let userLite = await uservice.findOneSelect({ 'basic.userId': orderDetails.user.userId }, { baseCurrency: 1 });
            //get caseDetails
            let caseDetails = await cservice.findOneSelect({ caseId: orderDetails.caseId }, {});
            //beneficiary currency
            let beneficiaryDetails = await uservice.findOneSelect({ 'basic.userId': caseDetails.beneficiary.userId }, { baseCurrency: 1 });
            let base = orderDetails.currency;
            let caseCurrency = caseDetails.baseCurrency;
            let benefactorCurrency = userLite.baseCurrency;
            let beneficiaryCurrency = beneficiaryDetails.baseCurrency;
            let orderId = orderDetails.orderId;
            let orderStatus = OrderStatus.Paid;
            let userId = orderDetails.user.userId;
            let txnCurrency = orderDetails.currency;
            let paymentType = orderDetails.paymentType;
            let newTx = {
                amount: payoutTx.data.Amount,
                currency: payoutTx.data.Currency,
                trnReference: '',
                trnHash: payoutTx.data.ExtRef,
                walletAddress: payoutTx.data.CryptoAddress,
                status: OrderStatus.Completed,
            } as OrderTransaction;
            //get latest rates
            let latestRates = await exchange.ratesSet(base, caseCurrency, beneficiaryCurrency, benefactorCurrency, txnCurrency, paymentType, orderId, orderStatus, userId);
            let orderRateSet = {
                beneficiaryRate: {
                    rate: latestRates.beneficiaryRate,
                    currency: beneficiaryCurrency
                },
                benefactorRate: {
                    rate: latestRates.benefactorRate,
                    currency: benefactorCurrency
                },
                caseRate: {
                    rate: latestRates.caseRate,
                    currency: caseCurrency
                },
                txnRate: {
                    rate: latestRates.txnRate,
                    currency: txnCurrency
                },
            } as RatesSet;
            newTx.orderRate = orderRateSet;
            if (payoutTx.status == 200) {
                console.log('In 200 status');
                //update order
                let updateOrder = await this.updatePart({ orderId: orderId }, {
                    $push: {
                        transactions: newTx
                    },
                    $set: {
                        status: OrderStatus.Completed
                    }
                });
                //update case with order Completed in donation array
                let updateCase = await cservice.updatePart({ caseId: orderDetails.caseId, donations: { $elemMatch: { 'order.orderId': orderId, 'order.status': OrderStatus.Paid } } },
                    {
                        $set:
                        {
                            "donations.$.order.status": OrderStatus.Completed
                        }
                    });
                //email to beneficiary
                //let sendEmailtoBeneficiary = await emailService.beneficiaryEmailDonationPayoutCompleted(caseDetails.beneficiary.userId, caseDetails.beneficiary.firstName, caseDetails.beneficiary.language, orderDetails.orderId, payoutTx.Amount, orderDetails.caseId, payoutTx.data.cryptoAddress, payoutTx.data.ExtRef);
                console.log('final return', orderDetails);
                return { status: 200, data: orderDetails };
            } else {
                //update order
                let updateOrder = await this.updatePart({ orderId: orderId }, {
                    $push: {
                        transactions: newTx
                    },
                    $set: {
                        status: OrderStatus.ReleaseErrored
                    }
                });
                return { status: 500, data: orderDetails };

            }

        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err } };
        }
    }

    async lockOrder(orderId, lockingUserId) {
        let getOrder = await this.findOneSelect({ orderId: orderId }, {});
        if (getOrder) {
            if (!getOrder.isLocked) {
                const lockDate = new Date();
                lockDate.setHours(lockDate.getHours() + 1);
                let lockOrder = await this.updatePart({ orderId: orderId }, {
                    $set: {
                        isLocked: true,
                        LockedUntil: lockDate,
                        LockedBy: lockingUserId
                    }
                });
                let auditLogData = AuditData(`Successfully locked an order, Id:${orderId}`, lockingUserId, 200, JSON.parse(`OrderId:${orderId} locked till ${lockDate} by ${lockingUserId}`));
                await auditLog.create(auditLogData);
                return { status: 200, data: `OrderId Locked` };
            } else {
                let auditLogData = AuditData(`Failed to lock an order, Id:${orderId}`, lockingUserId, 200, JSON.parse(`OrderId:${orderId} locked till ${getOrder.LockedUntil} by ${getOrder.LockedBy}`));
                await auditLog.create(auditLogData);
                return { status: 500, data: `OrderId already Locked` };
            }
        } else {
            return { status: 500, data: `Order not found` };
        }
    }

    async unlockOrder(orderId, unlockingUserId) {
        let getOrder = await this.findOneSelect({ orderId: orderId }, {});
        if (getOrder) {
            if (getOrder.isLocked) {
                let lockOrder = await this.updatePart({ orderId: orderId }, {
                    $set: {
                        isLocked: false,
                        LockedUntil: '',
                        LockedBy: ''
                    }
                });
                let auditLogData = AuditData(`Successfully locked an order, Id:${orderId}`, unlockingUserId, 200, JSON.parse(`OrderId:${orderId} unlocked by ${unlockingUserId}`));
                await auditLog.create(auditLogData);
                return { status: 200, data: `OrderId Locked` };
            } else {
                let auditLogData = AuditData(`Failed to unlock an order, Id:${orderId}`, unlockingUserId, 500, JSON.parse(`OrderId:${orderId} already locked till ${getOrder.LockedUntil} by ${getOrder.LockedBy}`));
                await auditLog.create(auditLogData);
                return { status: 500, data: `OrderId already Locked` };
            }
        } else {
            return { status: 500, data: `Order not found` };
        }
    }

    async isOrderUsable(orderId) {
        let getOrder = await this.findOneSelect({ orderId: orderId }, {});
        console.log('getOrder',getOrder);
        if ( getOrder.isLocked === undefined || (getOrder && getOrder.isLocked)) {
            return false;
        } else {
            return true
        }
    }
}