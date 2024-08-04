const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mediasoup = require('mediasoup');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIo(server, {
    transports: ['websocket'], // Force WebSocket transport
});

const mediaCodecs = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
            'x-google-start-bitrate': 1000,
        },
    },
];

let worker;
let router;
const rooms = new Map();

async function startWorker() {
    worker = await mediasoup.createWorker();
    worker.on('died', () => {
        console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
        setTimeout(() => process.exit(1), 2000);
    });

    router = await worker.createRouter({ mediaCodecs });
    console.log('Router created with media codecs');
}

startWorker();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('getRouterRtpCapabilities', (callback) => {
        console.log('Received getRouterRtpCapabilities request');
        callback(router.rtpCapabilities);
    });

    socket.on('createRoom', (callback) => {
        console.log('Received createRoom request');
        const roomId = Math.random().toString(36).substring(7);
        rooms.set(roomId, { peers: new Map(), transports: new Map() });
        console.log('Room created with ID:', roomId);
        callback({ roomId });
    });

    socket.on('joinRoom', async ({ roomId }, callback) => {
        console.log(`Join request for room ID: ${roomId}`);
        const room = rooms.get(roomId);
        if (!room) {
            console.error('Room not found:', roomId);
            return callback({ error: 'Room not found' });
        }

        const transport = await router.createWebRtcTransport({
            listenIps: [{ ip: '0.0.0.0', announcedIp: '34.172.188.180' }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            portRange: { min: 40000, max: 49999 },
        });

        room.transports.set(transport.id, transport);
        room.peers.set(socket.id, transport);
        console.log('Transport created for peer:', socket.id);

        callback({
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        });
    });

    socket.on('connectTransport', async ({ transportId, dtlsParameters }, callback) => {
        console.log(`Connect transport request for transport ID: ${transportId}`);
        console.log('Received dtlsParameters:', dtlsParameters); // Log dtlsParameters for debugging

        if (!dtlsParameters || !dtlsParameters.fingerprints) {
            console.error('Invalid dtlsParameters received:', dtlsParameters);
            return callback({ error: 'Invalid dtlsParameters' });
        }

        let transport;
        rooms.forEach(room => {
            if (room.transports.has(transportId)) {
                transport = room.transports.get(transportId);
            }
        });
        if (!transport) {
            console.error('Transport not found:', transportId);
            return callback({ error: 'Transport not found' });
        }
        await transport.connect({ dtlsParameters });
        console.log('Transport connected for peer:', socket.id);
        callback();
    });

    socket.on('produce', async ({ roomId, transportId, kind, rtpParameters }, callback) => {
        console.log(`Produce request for room ID: ${roomId}, kind: ${kind}`);
        const room = rooms.get(roomId);
        if (!room) {
            console.error('Room not found:', roomId);
            return callback({ error: 'Room not found' });
        }
        const transport = room.transports.get(transportId);
        if (!transport) {
            console.error('Transport not found:', transportId);
            return callback({ error: 'Transport not found' });
        }
        const producer = await transport.produce({ kind, rtpParameters });

        producer.on('transportclose', () => {
            producer.close();
        });

        room.peers.forEach((peer, peerId) => {
            if (peerId !== socket.id) {
                io.to(peerId).emit('newProducer', { producerId: producer.id, kind });
            }
        });

        console.log('Producer created for peer:', socket.id, 'ID:', producer.id);
        callback({ id: producer.id });
    });

    socket.on('consume', async ({ roomId, producerId, rtpCapabilities }, callback) => {
        console.log(`Consume request for room ID: ${roomId}, producer ID: ${producerId}`);
        const room = rooms.get(roomId);
        if (!room) {
            console.error('Room not found:', roomId);
            return callback({ error: 'Room not found' });
        }
        const transport = room.peers.get(socket.id);
        if (!router.canConsume({ producerId, rtpCapabilities })) {
            console.error('Cannot consume:', producerId);
            return callback({ error: 'cannot consume' });
        }

        const consumer = await transport.consume({ producerId, rtpCapabilities });
        console.log('Consumer created for peer:', socket.id, 'ID:', consumer.id);
        callback({
            id: consumer.id,
            producerId: consumer.producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            type: consumer.type,
            producerPaused: consumer.producerPaused,
        });
        consumer.on('transportclose', () => {
            consumer.close();
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        rooms.forEach(room => {
            room.peers.delete(socket.id);
        });
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
