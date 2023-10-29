export class Donations{
    fullName: string;
    email: string;
    mobile: string;
    amount: string;
    currency: string;
    paymentType: string;
}

export class DonationsObj{
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    amount: string;
    tipAmount: string;
    currency: string;
    digitalCurrency?: string;
    baseFiatCurrency: string;
    paymentType: string;
    address: string;
    country: string;
    city: string;
    pinCode: string;
    comment: string;
    phone:string;
    isAnonymously: boolean;
    donationAnonymously:string;
    donateOccurance: string;
    donationAmountFormated: number;
    tipAmountFormated: number;
    totalAmount: string;
    totalAmountFormated: number;
    url: string;
    commissionPercentage: number;
}

export class DonationResponse{
    caseId: string;
    txHash: string;
    orderId: string;
}

export class CryptoAddress{
    address: string;
    coin: string
}