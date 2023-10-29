export class NotifyResponseData<T> {
    status: number;
    data: T;
    username: string;
    constructor(status: number, data: T, username: string) {
        this.status = status;
        this.data = data;
        this.username = username;
    }
}