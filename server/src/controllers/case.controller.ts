import { Request, Response } from 'express';
import { CaseOperations } from '../platform/case.operations';
import { RatingData } from '../data/rating';
import { pageCount } from '../services/page.service';
import { ICaseCreate } from "data/case";
import { BitgoOperations } from '../platform/bitgoAPI';
import { OrderService } from '../services/order.service';
import { CaseService } from '../services/case.service';
import { MerchantTransactionsLite, OrderStatus, OrderTransaction, RatesSet } from '../data/order';
//import { SocketNotify } from '../services/socket.service';
import { AuditLogSevice } from '../services/auditLog.service';
import { AuditData, coinValue, search, resolveUrl, resolveReturnUrl } from '../config/common';
import { keys } from '../config/keys';
import { getEnvValue } from '../config/common';
import { emailSendService } from '../services/email.service';
import { ExchangeRatesSerivce } from '../services/exchangeRates.service';
import { Currency, RateResult } from '../data/common';
import { UserService } from '../services/user.service';
const exchange: ExchangeRatesSerivce = new ExchangeRatesSerivce();
const auditLog: AuditLogSevice = new AuditLogSevice();
let uservice: UserService = new UserService();

export class CaseController {

    constructor() {
    }

    async postCase(req: Request, res: Response) {
        try {
            const newCase: ICaseCreate = req.body;
            if (newCase == undefined || !newCase) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.saveCase(newCase);
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async putCase(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const newCase: ICaseCreate = req.body;
            if (newCase == undefined || !newCase) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.updateCase(caseId, newCase);
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async postRating(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const newRating: RatingData = req.body;
            if (newRating == undefined || !newRating) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.saveCaseRating(caseId, newRating);
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async getRating(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.getCaseRating(caseId);
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async getAllMyCases(req: Request, res: Response) {
        try {
            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.getMyCases();
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getCaseDetails(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.getMyCaseDetails(caseId)
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async getCaseRatings(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;

            //calcualting page, perPage and skip
            const pageOps = new pageCount();
            let pageResults = await pageOps.pageCalculations(req, res);
            let page = pageResults.page;
            let perPage = pageResults.perPage;
            let skip = pageResults.skip;

            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.getCaseRatings(caseId, perPage, skip, page)
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }

    }
    async postStatusForCase(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const caseStatus: string = req.body.caseStatus;
            if (caseStatus == undefined || !caseStatus) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.updateMyCaseStatus(caseId, caseStatus)
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async uploadPhotos(req: any, res: Response) {
        try {
            const caseId: string = req.params.id;
            const file = req.files;
            if (file == undefined || !file) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const caseOps = new CaseOperations(req, res);
            await caseOps.uploadCasePhotos(caseId, file, req, res);
            // res.send(dataResults);
            // return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async removePhotos(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const file = req.body.uniqueName;
            if (file == undefined || !file) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const caseOps = new CaseOperations(req, res);
            let dataResults = await caseOps.removeCasePhotos(file, caseId);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getCases(req: Request, res: Response) {
        try {
            //calcualting page, perPage and skip
            const pageOps = new pageCount();
            let pageResults = await pageOps.pageCalculations(req, res);
            let page = pageResults.page;
            let perPage = pageResults.perPage;
            let skip = pageResults.skip;

            const caseOps = new CaseOperations(req, res);
            let getAllCases = await caseOps.viewAllCases(perPage, skip, page);
            res.statusCode = getAllCases.status;
            res.send(getAllCases);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getSearchCases(req: Request, res: Response) {
        try {
            //calcualting page, perPage and skip
            const caseOps = new CaseOperations(req, res);
            let getAllCases = await caseOps.searchAllCases();
            res.send(getAllCases);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async sortedcases(req: Request, res: Response) {
        try {
            //calcualting page, perPage and skip
            const pageOps = new pageCount();
            let pageResults = await pageOps.pageCalculations(req, res);
            let page = pageResults.page;
            let perPage = pageResults.perPage;
            let skip = pageResults.skip;

            const caseOps = new CaseOperations(req, res);
            let getAllCasesSorted = await caseOps.viewAllCasesSorted(perPage, skip, page);
            res.statusCode = getAllCasesSorted.status;
            res.send(getAllCasesSorted);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async getCase(req: Request, res: Response) {
        try {
            const caseId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let getCase = await caseOps.getCase(caseId);
            res.statusCode = getCase.status
            res.send(getCase);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getBenefiProfile(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let dataResult = await caseOps.getBeneficiaryProfile(userId);
            res.statusCode = dataResult.status;
            res.send(dataResult);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getBenefiCases(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            var dataResult = await caseOps.viewsAllBeneficiaryCases(userId);
            res.statusCode = dataResult.status;
            res.send(dataResult);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getBenefiRatings(req: Request, res: Response) {
        try {
            const beneficiaryId = req.params.id;

            //calcualting page, perPage and skip
            const pageOps = new pageCount();
            let pageResults = await pageOps.pageCalculations(req, res);
            let page = pageResults.page;
            let perPage = pageResults.perPage;
            let skip = pageResults.skip;

            const caseOps = new CaseOperations(req, res);
            let getCase = await caseOps.getBeneficiaryRatings(beneficiaryId, perPage, skip, page);
            res.statusCode = getCase.status;
            res.send(getCase);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async contactBenefi(req: Request, res: Response) {
        try {
            const beneficiaryId = req.params.id;
            let name = req.body.name;
            let email = req.body.email;
            let phone = req.body.phone;
            let message = req.body.message;

            if (email == undefined || !email || name == undefined || !name ||
                phone == undefined || !phone || message == undefined || !message) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }
            const caseOps = new CaseOperations(req, res);
            let dataResult = await caseOps.sendEmailtoBeneficiary(name, email, phone, message, beneficiaryId);
            res.statusCode = dataResult.status;
            res.send(dataResult);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getBenefaProfile(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let dataResult = await caseOps.getBenefactorProfile(userId);
            res.statusCode = dataResult.status;
            res.send(dataResult);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getBenefaDonations(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let donationCases = await caseOps.viewsAllDonationCases(userId);
            res.statusCode = donationCases.status;
            res.send(donationCases);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async contactBenefa(req: Request, res: Response) {
        try {
            const benefactorId = req.params.id;
            let name = req.body.name;
            let email = req.body.email;
            let phone = req.body.phone;
            let message = req.body.message;

            if (email == undefined || !email || name == undefined || !name ||
                phone == undefined || !phone || message == undefined || !message) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const caseOps = new CaseOperations(req, res);
            let dataResult = await caseOps.sendEmailtoBenefactor(name, email, phone, message, benefactorId);
            res.statusCode = dataResult.status;
            res.send(dataResult);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async donate(req: Request, res: Response) {
        try {
            let coin = req.body.currency;
            let sellCurrency = req.body.digitalCurrency;
            let amount = req.body.donationAmountFormated;
            let tipAmount = req.body.tipAmountFormated;
            let paymentType = req.body.paymentType;
            let totalAmount = req.body.totalAmountFormated;
            let comments = req.body.comment;
            let isAnonyms = req.body.isAnonymously;
            let url = req.body.url;
            let monniUrl = resolveUrl(url);
            let returnUrl = resolveReturnUrl(url);
            let anonymsValue;
            if (isAnonyms) {
                anonymsValue = req.body.donationAnonymously;
            }
            if (!coin || !paymentType
                || coin == undefined || amount == undefined || tipAmount == undefined
                || paymentType == undefined || totalAmount == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const caseId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let donationResult = await caseOps.createCaseDonate(caseId, coin, amount, tipAmount, totalAmount, paymentType, comments, isAnonyms, anonymsValue, sellCurrency);
            donationResult.data.monniUrl = monniUrl;
            donationResult.data.returnUrl = returnUrl;
            res.statusCode = donationResult.status;
            res.send(donationResult);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async webhooks(req: Request, res: Response) {
        try {
            let bitgodata = req.body;
            let hash = req.body.hash;
            let transfer = req.body.transfer;
            let coin = req.body.coin;
            let type = req.body.type;
            let state: string = req.body.state;
            let wallet = req.body.wallet;
            coin = coinValue(coin);
            const bitgoOps: BitgoOperations = new BitgoOperations();
            let oservice: OrderService = new OrderService();
            let cservice: CaseService = new CaseService();
            if (coin == null || hash == null || state == null || type == null || wallet == null) {
                //AuditLog webhook,this webhook is happened whenever a new block in added to blockchain
                let auditLogData = AuditData('Bitgo webhook not satified', 'non-user', 200, req.body);
                let createLog = await auditLog.create(auditLogData);
                return;
            }

            if (coin && hash && state && (type.localeCompare('transfer') == 0)) {
                // get tx bitgo api
                let transactionDetails = await bitgoOps.getTransaction(coin, hash);
                let orderDetails;

                if (transactionDetails.status == 200) {
                    let outputs = transactionDetails.data.outputs;
                    let outputAddress;
                    let txAmount;
                    let txHash;
                    for (let i = 0; i < outputs.length; i++) {
                        // get order details when matched with webhook address and transaction address in order doc 
                        txAmount = outputs[i].value / 100000000;
                        orderDetails = await oservice.findOneSelect({ amount: txAmount, status: OrderStatus.Quoted, transactions: { $elemMatch: { walletAddress: outputs[i].address, trnHash: { "$exists": true, "$eq": "" } } } },
                            {
                                orderId: 1,
                                tenantId: 1,
                                caseId: 1,
                                currency: 1,
                                amount: 1,
                                user: 1,
                                breakdown: 1,
                                paymentType: 1
                            })
                        if (orderDetails != null) {
                            outputAddress = outputs[i].address;
                            txHash = hash;
                            break;
                        }
                    }
                    if (orderDetails) {
                        console.log('I ma inside of orderDEtails');
                        let caseDetails = await cservice.findOneSelect({ caseId: orderDetails.caseId }, { baseCurrency: 1, beneficiary: 1 });
                        let beneficiaryDetails = await uservice.findOneSelect({ 'basic.userId': caseDetails.beneficiary.userId }, { baseCurrency: 1 });
                        let base = coin;
                        let quote = caseDetails.baseCurrency;
                        //person who is donating
                        let userLite = await uservice.findOneSelect({ 'basic.userId': orderDetails.user.userId }, { baseCurrency: 1, basic: 1 });
                        let caseCurrency = caseDetails.baseCurrency;
                        let benefactorCurrency: string = userLite.baseCurrency;
                        let beneficiaryCurrency = beneficiaryDetails.baseCurrency;
                        let orderId = orderDetails.orderId;
                        let orderStatus = OrderStatus.Paid;
                        let userId = userLite.basic.userId;
                        let txnCurrency = Currency.EUR;  //set trnCurrency as EUR if payment type is crypto
                        let paymentType = orderDetails.paymentType;
                        //get the latest rates
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
                        //get donationAmount
                        let resultObj = search('donationAmount', orderDetails.breakdown);
                        let donationAmount = resultObj.amount;
                        let txDate = new Date();
                        let newTx = {
                            amount: donationAmount,
                            currency: orderDetails.currency,
                            trnReference: '',
                            trnHash: txHash,
                            walletAddress: outputAddress,
                            orderRate: orderRateSet,
                            status: OrderStatus.Paid,
                        } as OrderTransaction;
                        //Auditlog webhook when matched
                        let auditLogData = AuditData('Bitgo webhook executed', orderDetails.user.userId, 200, req.body);
                        let createLog = await auditLog.create(auditLogData);
                        //update order with txHash, status, date and rateSet
                        let updateOrder = await oservice.updatePart({ status: OrderStatus.Quoted, transactions: { $elemMatch: { walletAddress: outputAddress, } }, },
                            {
                                $push: {
                                    transactions: newTx
                                },
                                $set:
                                {
                                    orderRate: orderRateSet,
                                    status: OrderStatus.Paid,
                                }
                            });

                        //get caseDetails;
                        let CaseDetails = await cservice.findOneSelect({ caseId: orderDetails.caseId, donations: { $elemMatch: { 'user.userId': orderDetails.user.userId, 'order.amount': donationAmount, 'order.status': OrderStatus.Quoted } } }, {
                            beneficiary: 1
                        });
                        //update case with order paid in donation array
                        let updateCase = await cservice.updatePart({ caseId: orderDetails.caseId, donations: { $elemMatch: { 'user.userId': orderDetails.user.userId, 'order.amount': donationAmount, 'order.orderId': orderId, 'order.status': OrderStatus.Quoted } } },
                            {
                                $set:
                                {
                                    "donations.$.order.status": OrderStatus.Paid
                                }
                            })

                        if (updateCase && updateOrder) {
                            let emailService: emailSendService = new emailSendService();
                            let donationAmountStr = resultObj.amount + ' ' + orderDetails.currency;
                            //email to benefactor
                            let sendEmail = await emailService.benefactorEmailDonationReceived(orderDetails.user.userId, orderDetails.user.firstName, orderDetails.user.language, orderDetails.orderId, donationAmountStr, orderDetails.caseId);
                            //email to beneficiary
                            let sendEmailtoBeneficiary = await emailService.beneficiaryEmailDonationReceived(CaseDetails.beneficiary.userId, CaseDetails.beneficiary.firstName, CaseDetails.beneficiary.language, orderDetails.orderId, donationAmountStr, orderDetails.caseId);
                        }
                    }
                }
            }
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async validateCryptoAddress(req: Request, res: Response) {
        try {
            const caseOps = new CaseOperations(req, res);
            let cryptoAddress = req.params.address;
            let coin = req.params.coin;
            if (!cryptoAddress || !coin || cryptoAddress == undefined || coin == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            let validateResult = await caseOps.validateCryptoAddress(cryptoAddress, coin);
            if (validateResult.status == 200) {
                res.statusCode = validateResult.status;
                res.send(validateResult);
                return;
            } else {
                res.statusCode = validateResult.status;
                res.send(validateResult);
                return;
            }
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async donateDetails(req: Request, res: Response) {
        try {
            const caseId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let donationResult = await caseOps.getCaseDonateInfo(caseId);
            res.statusCode = donationResult.status;
            res.send(donationResult);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async sendCoins(req: Request, res: Response) {
        try {
            const caseId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            let sendCoins = await caseOps.sendCoinsToReveicer(caseId);
            res.statusCode = sendCoins.status;
            res.send(sendCoins);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async checkPayment(req: Request, res: Response) {
        try {
            const caseOps = new CaseOperations(req, res);
            let cryptoAddress = req.params.address;
            let coin = req.params.coin;
            let amount = req.params.amount;
            let caseId = req.params.caseId;
            if (!cryptoAddress || !coin || !amount || cryptoAddress == undefined || coin == undefined || amount == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            let validateResult = await caseOps.checkPaymentStatus(caseId, cryptoAddress, amount, coin);
            if (validateResult.status == 200) {
                res.statusCode = validateResult.status;
                res.send(validateResult);
                return;
            } else {
                res.statusCode = validateResult.status;
                res.send(validateResult);
                return;
            }
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async benfaTransactionsList(req: Request, res: Response) {
        try {
            const caseOps = new CaseOperations(req, res);
            const userId = req.params.id;
            if (!userId || userId == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            let allDonations = await caseOps.getDonorDonations(userId);
            res.statusCode = allDonations.status;
            res.send(allDonations);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async successDonation(req: any, res: any) {
        try {
            let orderId = req.query.OrderId as string;
            let merchantReferenceId = req.query.ReferenceId as string;
            let donationCurrency = req.query.BuyCurrency as string;
            let donationAmount = req.query.Amount as string;
            let orderStatus = req.query.OrderStatus as string;
            let merchantCode = req.query.MerchantCode as string;
            const caseOps = new CaseOperations(req, res);
            let getOrder = await caseOps.getOrderInfo(orderId, merchantReferenceId, donationCurrency, donationAmount, orderStatus, merchantCode);
            if (getOrder.status == 200) {
                res.redirect(`${keys.APPURL}/donate-info?orderId=${orderId}&orderAmount=${donationAmount}&currency=${donationCurrency}&status=${orderStatus}`);//sent data in query parameters
            } else {
                res.redirect(`${keys.APPURL}/donate-failure?orderId=${orderId}&orderAmount=${donationAmount}&currency=${donationCurrency}&status=${orderStatus}`);//sent data in query parameters
            }
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }


    async benefTransactionsList(req: Request, res: Response) {
        try {
            const caseOps = new CaseOperations(req, res);
            const userId = req.params.id;
            if (!userId || userId == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            let allDonations = await caseOps.getReceiverDonations(userId);
            res.statusCode = allDonations.status;
            res.send(allDonations);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    //TODO PARTIALLY DONE
    async failedDonation(req: Request, res: Response) {
        try {
            //todo: redirect to failure page. below is a sample redirect
            res.redirect(`/home`);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async caseTransactionsList(req: Request, res: Response) {
        try {
            const caseOps = new CaseOperations(req, res);
            const caseId = req.params.id;
            if (!caseId || caseId == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            let allDonations = await caseOps.caseDonationsList(caseId);
            res.statusCode = allDonations.status;
            res.send(allDonations);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async MerchantWebhook(req: Request, res: Response) {
        try {
            let auditLogData = AuditData('Monni Webhook Response', `Monni orderId - ${req.body.ReferenceId}`, 200, req.body);
            let createLog = await auditLog.create(auditLogData);
            let merchantReferenceId: string = req.body.OrderId as string;
            let orderId: string = req.body.ReferenceId;
            let donationCurrency: string = req.body.BuyCurrency as string;
            let donationAmount: string = req.body.Amount as string;
            let orderStatus = req.body.OrderStatus as string;
            let merchantCode = req.body.MerchantCode as string;
            let transactions = req.body.Transactions as MerchantTransactionsLite[];
            let rate = req.body.Rate; // Rate without currency ex:52000
            let rateStr = req.body.RateStr; // Rate with currency ex:52000 DKK/BTC
            let minerFees = req.body.MinersFee; // Miner Fees for BTC
            const caseOps = new CaseOperations(req, res);
            let updateOrder = await caseOps.UpdateOrder(orderId, merchantReferenceId, orderStatus, rateStr, rate, minerFees, transactions);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async caseBenefiProfile(req: Request, res: Response) {
        try {
            const caseId = req.params.id;
            const caseOps = new CaseOperations(req, res);
            if (!caseId || caseId == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            let dataResult = await caseOps.caseBeneficiaryProfile(caseId);
            res.statusCode = dataResult.status;
            res.send(dataResult);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }
}