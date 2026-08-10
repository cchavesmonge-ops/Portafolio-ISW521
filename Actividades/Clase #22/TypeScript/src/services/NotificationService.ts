import { INotification } from "../interfaces/INotification";

export class NotificationService{
    public processNotificationd(notifications: INotification[]): void {
        console.log("Analizando notificaciones por bloques\n");

        for (const notification of notifications) {
            notification.send();
        }
        console.log("Finalizacion del bloque de notificaciones\n\n");
    }
}
