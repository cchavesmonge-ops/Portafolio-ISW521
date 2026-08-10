import { BaseNotification } from "./BaseNotification";
export class SMSNotification extends BaseNotification {

    send(): void {
        this.logNotification("SMS");
        console.log(`Enviando SMS del numero:  ${this.recipient}`);
        console.log(`Mensaje: ${this.message}`);
    }
}