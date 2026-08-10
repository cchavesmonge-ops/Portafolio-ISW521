import { INotification } from "../interfaces/INotification";
export declare abstract class BaseNotification implements INotification {
    readonly recipient: string;
    readonly message: string;
    constructor(recipient: string, message: string);
    protected logNotification(type: string): void;
    abstract send(): void;
}
//# sourceMappingURL=BaseNotification.d.ts.map