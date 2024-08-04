declare module 'janus-gateway-js' {
    export class Client {
        constructor(url: string, options?: any);
        createConnection(id: string): Promise<Connection>;
    }

    export class Connection {
        createSession(): Promise<Session>;
    }

    export class Session {
        attachPlugin(pluginName: string): Promise<Plugin>;
    }

    export class Plugin {
        send(options: { message: any, jsep?: any }): void;
        createOffer(options: { media: any, stream: MediaStream, success: (jsep: any) => void, error: (error: any) => void }): void;
        handleRemoteJsep(jsep: any): void;
        on(event: 'message' | 'webrtcup' | 'remotestream', callback: (data: any) => void): void;
        hangup(): void;
    }
}
