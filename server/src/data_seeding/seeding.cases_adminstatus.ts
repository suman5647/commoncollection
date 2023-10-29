import { AdminStatus } from '../data/case';
import { CaseService } from '../services/case.service';
import { OrderService } from '../services/order.service';
import * as cases_data from './case.data.seed';

let cservice: CaseService = new CaseService();
let oservice: OrderService = new OrderService();
let cases = cases_data.data;
async function updateAdminStatus() {
    //  for (var j = 0; j < cases.length; j++) {

    let caseUpdateAdminStatus = await cservice.updateMany({}, {
        $set: {
            adminStatus: AdminStatus.Pending,
        }
    });

    let lockCases = await cservice.updateMany({}, {
        $set: {
            isLocked: false,
            LockedUntil: Date.now(),
            LockedBy: ''
        }
    });

    let lockOrders = await cservice.updateMany({}, {
        $set: {
            isLocked: false,
            LockedUntil: Date.now(),
            LockedBy: ''
        }
    });
    console.log(caseUpdateAdminStatus);
    console.log(lockCases);
    console.log(lockOrders);
    //}
}


let statusChangesPromise = updateAdminStatus();
Promise.all([statusChangesPromise]).then(
    (res) => {
        console.log('completed!!!');
        console.log(res);
        process.exit(0);
    },
    (rej) => {
        console.log('rejected!!!');
        console.log(rej);
        process.exit(1);
    }).catch(
        (err) => {
            console.log('unhandled exception!!!');
            console.log(err);
            process.exit(1);
        }
    );