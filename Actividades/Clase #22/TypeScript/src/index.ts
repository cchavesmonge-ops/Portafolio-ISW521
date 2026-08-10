import { INotification } from "./interfaces/INotification";
import { EmailNotification } from "./classes/EmailNotification";
import { SMSNotification } from "./classes/SMSNotificaction";
import { NotificationService } from "./services/NotificationService";

const email = new EmailNotification("prueba@gmail.com", "Hola ISW-521", "Prueba");

const sms = new SMSNotification("+50666666666", "Recibiendo pin: 4563");

const queue: INotification[] = [email, sms];

const service = new NotificationService();

service.processNotificationd(queue);
