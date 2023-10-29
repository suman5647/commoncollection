
export enum FileTypes {
    ImagePng = 'image/png',
    ImageJpg = 'image/jpg',
    VideoUrl = 'video/url'
}
export interface ItemData {
    code: string;
    text: string;
}

export interface GeoLocation {
    longitude: number;
    latitude: number;
}
export interface Contact {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}
export interface Address {
    language: String;
    country: String;
    state: String;
    city: String;
    place: String;
    addressLine1: String;
    addressLine2: String;
    pincode: String;
}
export interface Password {
    oldPassword: String,
    newPassword: String,
    newPassword2: String
}
