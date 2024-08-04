// types/mediasoup-client.d.ts
declare module 'mediasoup-client' {
    export class Device {
        load({ routerRtpCapabilities }: { routerRtpCapabilities: any }): Promise<void>;
        rtpCapabilities: any;
        createSendTransport(options: any): Transport;
        createRecvTransport(options: any): Transport;
    }

    export class Transport {
        on(event: string, callback: (...args: any[]) => void): void;
        produce(params: any): Promise<any>;
        close(): void;
        consume({ id, kind, rtpCapabilities }: { id: string, kind: string, rtpCapabilities: any }): Promise<Consumer>;
    }

    export class Consumer {
        // Define properties and methods for Consumer if needed
    }
}