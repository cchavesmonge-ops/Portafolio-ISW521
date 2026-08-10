"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotification = void 0;
const BaseNotification_1 = require("./BaseNotification");
class EmailNotification extends BaseNotification_1.BaseNotification {
    subject;
    constructor(recipient, message, subject) {
        super(recipient, message);
        this.subject = subject;
    }
    send() {
        this.logNotification("Email");
        console.log(`Enviando email de: ${this.recipient}`);
        console.log(`Con asunto: ${this.subject}`);
        console.log(`Cuerpo: ${this.message}`);
    }
}
exports.EmailNotification = EmailNotification;
//# sourceMappingURL=EmailNotification.js.map