"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmailNotification_1 = require("./classes/EmailNotification");
const SMSNotificaction_1 = require("./classes/SMSNotificaction");
const NotificationService_1 = require("./services/NotificationService");
const email = new EmailNotification_1.EmailNotification("prueba@gmail.com", "Hola ISW-521", "Prueba");
const sms = new SMSNotificaction_1.SMSNotification("+50666666666", "Recibiendo pin: 4563");
const queue = [email, sms];
const service = new NotificationService_1.NotificationService();
service.processNotificationd(queue);
//# sourceMappingURL=index.js.map