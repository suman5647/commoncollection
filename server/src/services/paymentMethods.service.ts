import { ServiceBase } from "./base";
import paymentMethodsSchema, { paymentMethodsModel } from "../models/paymentMethods";
import { paymentMethods } from "../data/paymentMethods";
import { RepositoryBase } from "../repository/base";

export class paymentMethodsService extends ServiceBase<paymentMethods, paymentMethodsModel> {
    constructor() {
        super(paymentMethodsSchema, "paymentMethods");
    }

    // add extra methods here
    test() { };
}