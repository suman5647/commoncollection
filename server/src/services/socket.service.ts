// import { UserService } from './user.service';
// import { io } from '../server';
// import { NotifyResponseData } from '../models/notify';

// export class SocketNotify {

//     async initializeConnection() {
//         io.on('connection', socket => {
//             socket.on('subcribe', async data => {
//                 if (data.username) {
//                     let uservice: UserService = new UserService();
//                     let updateUser = await uservice.updatePart({ email: data.username }, {
//                         $set: {
//                             socketId: socket.id
//                         }
//                     })
//                 }
//             });

//             socket.on('disconnect', () => {
//             });
//         })
//     }

//     async emit<T>(subject: string, data: T, to: string) {
//         let uservice: UserService = new UserService();
//         let userSocketId = await uservice.findOneSelect({ email: to }, { socketId: 1 });
//         let socketId = userSocketId.socketId;
//         io.to(socketId).emit(subject, new NotifyResponseData<T>(200, data, to));
//     }
// }

