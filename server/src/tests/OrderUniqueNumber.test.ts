import { OrderService } from '../services/order.service';

let oservice: OrderService = new OrderService();
async function getUniqueOrderId() {
    let orderId: number = 0;
    let idExists: boolean = true;
    let triedIds: Array<number> = [];

    do {
        do {
            orderId = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        }
        while (triedIds.includes(orderId));
        triedIds.push(orderId);
        let hasOrderId = await oservice.find({ orderId: orderId });
        console.log(hasOrderId);
        if (hasOrderId == null) {
            idExists = false;
        }
    }
    while (idExists);
    return orderId;
}

//let orderNumber = await getUniqueOrderId();
//console.log(orderNumber)