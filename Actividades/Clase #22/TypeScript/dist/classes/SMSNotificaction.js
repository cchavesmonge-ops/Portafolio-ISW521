"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSNotification = void 0;
const BaseNotification_1 = require("./BaseNotification");
class SMSNotification extends BaseNotification_1.BaseNotification {
    send() {
        this.logNotification("SMS");
        console.log(`Enviando SMS del numero:  ${this.recipient}`);
        console.log(`Mensaje: ${this.message}`);
    }
}
exports.SMSNotification = SMSNotification;
//# sourceMappingURL=SMSNotificaction.js.map