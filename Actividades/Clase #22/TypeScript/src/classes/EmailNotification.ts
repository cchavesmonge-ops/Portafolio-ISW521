import { BaseNotification } from "./BaseNotification";

export class EmailNotification extends BaseNotification {

    constructor(recipient: string, message: string, public readonly subject: string) {
        super(recipient, message);
    }

    send(): void {
        this.logNotification("Email");
        console.log(`Enviando email de: ${this.recipient}`);
        console.log(`Con asunto: ${this.subject}`);
        console.log(`Cuerpo: ${this.message}`);
    }
}
