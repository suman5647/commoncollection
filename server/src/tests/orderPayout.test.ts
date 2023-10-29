// import { AdminOperations } from '../platform/admin.operations';
import { OrderPayoutService } from '../services/orderPayout.service';
import { localizationService } from '../services/localization.service';
import {keys} from '../config/keys';
const localizeService: localizationService = new localizationService();
let orderPayoutService: OrderPayoutService = new OrderPayoutService();

// async function process(req: Request, res: Response) {
//     try {
//         const adminOps = new AdminOperations(req, res);
//         let dataResults = await adminOps.payoutSingleOrder('284131');
//         res.send(dataResults);
//         return;
//     } catch (err) {
//         res.statusCode = 500;
//         res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
//     }
// }
// async function sendEmail() {
//     let dataMessage = await localizeService.localizeIntro('beneficiaryMessages.beneficiaryCasePhotoNotFoundError', 'us-es', '500');
//     console.log(dataMessage);
// }

// sendEmail();

async function minerFees(){
    let minersFees1 = await orderPayoutService.getMinerFeesvalue(keys.MINERFEES.bitcoin, 'BTC', 'DKK');
    let minersFees2 = await orderPayoutService.getMinerFeesvalue(keys.MINERFEES.litecoin, 'LTC', 'DKK');
    console.log('minerFees1', minersFees1)
    console.log('minerFees2', minersFees2)
}

minerFees();