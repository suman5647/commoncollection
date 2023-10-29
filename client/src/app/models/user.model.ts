import { authProvider, BeneficiaryData, UserVerification } from './user';

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
  authProvider: authProvider[];
}

export interface OrderLite {
  amount: number;
  currency: String;
  status: String;
}