import { BeneficiaryData, UserVerification } from './user';

export interface UserLite {
  firstName: string;
  language: string;
  lastName: string;
  profilePhoto: string;
  userId: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  pinCode: string;
  place: string;
  state: string;
  reqProfile: BeneficiaryData;
  verification: UserVerification;
  baseCurrecy: string;
}

export interface OrderLite {
  amount: number;
  currency: string;
  status: string;
  orderId? : string
}