import { INotification } from "../interfaces/INotification";

export abstract class BaseNotification implements INotification {

    constructor(public readonly recipient: string, public readonly message: string) {
    }

    protected logNotification(type: string): void {
        console.log(`[Log - ${new Date().toISOString()}] Iniciando envio de ${type} a ${this.recipient}`);
    }

    abstract send(): void;
}