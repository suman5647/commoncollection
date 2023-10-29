// import { Injectable, Inject } from '@angular/core';
// import { Observable } from "rxjs";
// import { NotifyResponseData } from '../core/models/base.response.model';
// import * as socketio from 'socket.io-client';
// import { DOCUMENT } from '@angular/common';

// @Injectable({
//     providedIn: 'root'
// })
// export class SocketService {
//     public socket;
//     private url: string;

//     constructor(@Inject(DOCUMENT) private document: Document) {
//         this.url = document.location.protocol + '//' + document.location.hostname;
//     }

//     //Connect and emit donate event 
//     donateEmit(username: string) {
//         if (this.socket == null) {
//             this.socket = socketio(this.url, { transports: ['websocket'] });
//         }
//         if (!this.socket.connected) {
//             this.socket.connect();
//         }
//         this.socket.on('error', error => {
//             console.log(error);
//         });
//         this.socket.emit('subcribe', { username: username });
//     }

//     //disconnect socket whenever a successful completion of donation, close button cliked (without any donation), 
//     //navigate to different page/component
//     disconnectSocket(): void {
//         this.socket.disconnect();
//     }

//     //whenever a donation received
//     get<T>(subject: string): Observable<NotifyResponseData<T>> {
//         this.socket = socketio(this.url, { transports: ['websocket'] });

//         console.log('Emitted');
//         let observable = new Observable<NotifyResponseData<T>>(observer => {
//             this.socket.on(subject, (data) => {
//                 observer.next(data);
//             });
//         });
//         return observable;
//     }
// }