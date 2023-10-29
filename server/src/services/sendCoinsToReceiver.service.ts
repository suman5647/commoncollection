import { BitgoOperations } from '../platform/bitgoAPI';
import { coinValue } from '../config/common';
import { keys } from '../config/keys';

const bitgoOps: BitgoOperations = new BitgoOperations();

export class sendCoins {
    constructor() { }

    //get all active caseIds
    async getActiveCaseIds() {
        //let activeCases = await 

    }

    /***process all payouts to end receiver
     * @param coin name of digital currency (EX: BTC,LTC,BCH) 
     * @param amount amount to send(ex: 0.0045*1e8, 0.0023*1e8)
     * @param minConfirms minimum number of confirmation (0)
     * @param address crypto wallet address
     * @param userId userId/email to whom we are sending
     */
    async processPayout(coin: string, amount: number, minConfirms: number, address: string, userId: string) {
        let unlockSession = await bitgoOps.unlock();
        if (unlockSession.status == 200) {
            let result = unlockSession.data;
            let currentDateTime = new Date();
            let bitgoExpiryDateTime = result.session.unlock.expires;
            if (this.dateTimeCompare(bitgoExpiryDateTime, currentDateTime) < 0) {
                let results = {
                    status: 500,
                    data: 'Bitgo locked'
                };
                return results;
            }
            let walletDetails = await this.checkWalletBalance(coin, amount, userId);
            if (walletDetails) {
                let sendCoins = await bitgoOps.sendCoins(coin, amount, minConfirms, address, userId);
                if (sendCoins.status == 200) {
                    let coin = coinValue(sendCoins.data.transfer.coin);
                    let cryptoAddress = this.findWalletAddress(sendCoins.data, amount);
                    let results = {
                        status: sendCoins.status,
                        data: {
                            ExtRef: sendCoins.data.txid,
                            Amount: amount / keys.BTCTxUnits,
                            Currency: coin,
                            CryptoAddress: cryptoAddress
                        }
                    };
                    return results;

                } else {
                    let results = {
                        status: sendCoins.status,
                        data: 'Error is payout'
                    };
                    return results;
                }
            } else {
                let results = {
                    status: 500,
                    data: 'Error is payout. No required balance available in wallet'
                };
                return results;
            }
        }
    }

    async checkWalletBalance(coin: string, requiredAmount: number, userId: string) {
        let wallet = await bitgoOps.getWalletDetails(coin, userId);
        if (wallet.status === 200) {
            if (wallet.data.balance > requiredAmount)
                return true;
            else
                return false;
        } else {
            return false;
        }
    }

    private dateTimeCompare(DateA, DateB) {
        var a = new Date(DateA);
        var b = new Date(DateB);
        let msDateA = Date.UTC(a.getFullYear(), a.getMonth() + 1, a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds());
        let msDateB = Date.UTC(b.getFullYear(), b.getMonth() + 1, b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds());
        if (parseFloat(msDateA.toString()) < parseFloat(msDateB.toString()))
            return -1;  // lt
        else if (parseFloat(msDateA.toString()) == parseFloat(msDateB.toString()))
            return 0;  // eq
        else if (parseFloat(msDateA.toString()) > parseFloat(msDateB.toString()))
            return 1;  // gt
        else
            return null;  // error
    }

    private findWalletAddress(sendCoinsData, amount) {
        let getEntries = sendCoinsData.transfer.entries;
        let requiredEntry = getEntries.filter(obj => {
            return obj.value == amount
        });
        return requiredEntry[0].address;
    }
}