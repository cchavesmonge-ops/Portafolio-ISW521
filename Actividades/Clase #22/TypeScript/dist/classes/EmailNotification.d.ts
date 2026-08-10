import { BaseNotification } from "./BaseNotification";
export declare class EmailNotification extends BaseNotification {
    readonly subject: string;
    constructor(recipient: string, message: string, subject: string);
    send(): void;
}
//# sourceMappingURL=EmailNotification.d.ts.map