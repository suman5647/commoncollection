import { BitgoOperations } from './bitgoAPI';
import * as QRCode from 'qrcode';
import { Support } from 'aws-sdk';

export class Donations {
    public async createDonation(coin: string, amount: number, label: string = '', userId: string) {
        const bitgoOps: BitgoOperations = new BitgoOperations();
        let address = await bitgoOps.createWalletAddress(coin, 1, label, userId);
        let qrString;
        let qrCode;
        if (address.status == 200) {
            let walletAddress = address.data.address;
            let amtInSatoshi = this.formatAmount(amount);
            qrString = this.getQRCodeString(coin, walletAddress, amtInSatoshi);
            //to get qrcode
            qrCode = await this.QRCodeGenerator(qrString);

            if (qrCode.status == 200) {
                const donation = {
                    qrcodeImg: qrCode.data,
                    amount: amtInSatoshi,
                    address: walletAddress,
                    coin: coin
                }
                return { data: donation, status: 200 };
            } else {
                return qrCode;
            }
        } else {
            return { data: address, status: address.status };
        }
    }

    private async QRCodeGenerator(qrString: string) {
        let qrcode = await QRCode.toDataURL(qrString, { errorCorrectionLevel: 'Q' })
            .then((response) => {
                return { data: response, status: 200 };
            }).catch((error) => {
                return { data: error, status: 500 };
            })
        return qrcode;
    }

    private formatAmount(x: number) {
        return Number.parseFloat(x.toString()).toFixed(8);
    }

    private getQRCodeString(coin: string, walletAddress: string, amtInSatoshi: string) {
        let qrString;
        switch (coin) {
            case 'BTC':
                qrString = (`bitcoin:${walletAddress}?amount=${amtInSatoshi}`);
                break;
            case 'LTC':
                qrString = (`litecoin:${walletAddress}?amount=${amtInSatoshi}`);
                break;
            case 'BCH':
                qrString = (`bitcoincash:${walletAddress}?amount=${amtInSatoshi}`);
                break;
            default:
                throw 'coin not supported';
                break;
        }
        return qrString;
    }

}