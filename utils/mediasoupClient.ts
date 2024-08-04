import io from 'socket.io-client';
import { mediaDevices, MediaStream, registerGlobals } from 'react-native-webrtc';
import { Device, Transport, Consumer } from 'mediasoup-client';
import { TransportOptions } from '@/types/react-native-webrtc-extensions';

// Register WebRTC globals
registerGlobals();

let sendTransport: Transport;
let recvTransport: Transport;
let currentRoomId: string;
let device: Device;

const socket = io('http://34.172.188.180:3000', {
    transports: ['websocket'], // Force WebSocket transport
});

socket.on('connect', async () => {
    console.log('Connected to server');
    try {
        device = new Device();
        const routerRtpCapabilities = await new Promise<any>((resolve, reject) => {
            console.log('Requesting Router RTP Capabilities');
            socket.emit('getRouterRtpCapabilities', (response: any) => {
                if (response) {
                    console.log('Received Router RTP Capabilities');
                    resolve(response);
                } else {
                    console.error('Failed to get Router RTP Capabilities');
                    reject('Failed to get Router RTP Capabilities');
                }
            });
        });
        console.log('Router RTP Capabilities:', routerRtpCapabilities);
        await device.load({ routerRtpCapabilities });
        console.log('Device loaded with router RTP capabilities');
    } catch (error) {
        console.error('Error during connection setup:', error);
    }
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

export async function createRoom(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        socket.emit('createRoom', (response: { roomId?: string; error?: string }) => {
            if (response.error) {
                console.error('Error creating room:', response.error);
                reject(new Error(response.error));
            } else {
                console.log('Room created:', response.roomId);
                currentRoomId = response.roomId!;
                resolve(response.roomId!);
            }
        });
    });
}

export async function joinRoom(roomId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        socket.emit('joinRoom', { roomId }, async (transportOptions: TransportOptions | { error: string }) => {
            if ('error' in transportOptions) {
                return reject(new Error(transportOptions.error));
            }
            try {
                currentRoomId = roomId;
                sendTransport = await createTransport(transportOptions, 'send');
                recvTransport = await createTransport(transportOptions, 'recv');
                resolve();
            } catch (error) {
                console.error('Error creating transports:', error);
                reject(error);
            }
        });
    });
}

async function createTransport({ id, iceParameters, iceCandidates, dtlsParameters }: TransportOptions, direction: 'send' | 'recv'): Promise<Transport> {
    if (!device) {
        throw new Error('Device not initialized');
    }

    let transport: Transport;
    if (direction === 'send') {
        transport = device.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
    } else {
        transport = device.createRecvTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
    }

    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
        console.log('Sending dtlsParameters:', dtlsParameters); // Add logging for dtlsParameters
        socket.emit('connectTransport', { transportId: id, dtlsParameters }, (response: any) => {
            if (response && response.error) {
                console.error('Transport connect error:', response.error);
                errback(response.error);
            } else {
                callback();
            }
        });
    });

    if (direction === 'send') {
        transport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
            socket.emit('produce', {
                roomId: currentRoomId,
                transportId: id,
                kind,
                rtpParameters,
            }, (response: any) => {
                if (response.error) {
                    console.error('Produce error:', response.error);
                    errback(response.error);
                } else {
                    callback({ id: response.id });
                }
            });
        });
    }

    return transport;
}

export async function startStream(): Promise<MediaStream> {
    const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
    });

    if (sendTransport) {
        stream.getTracks().forEach(track => {
            const params = { track };
            sendTransport.produce(params);
        });
    }

    return stream;
}

socket.on('newProducer', async ({ producerId, kind }) => {
    if (recvTransport) {
        const consumer: Consumer = await recvTransport.consume({
            id: producerId,
            kind,
            rtpCapabilities: device.rtpCapabilities,
        });
        console.log('New consumer created:', consumer);
    }
});

export async function endCall() {
    if (currentRoomId) {
        await deleteRoom(currentRoomId);
    }
    socket.disconnect();
    if (sendTransport) {
        sendTransport.close();
    }
    if (recvTransport) {
        recvTransport.close();
    }
}

async function deleteRoom(roomId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        socket.emit('deleteRoom', { roomId }, (response: { error?: string }) => {
            if (response.error) {
                console.error('Error deleting room:', response.error);
                reject(new Error(response.error));
            } else {
                console.log('Room deleted:', roomId);
                resolve();
            }
        });
    });
}
