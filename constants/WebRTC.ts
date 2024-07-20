// app/constants/WebRTC.ts
import { mediaDevices, RTCPeerConnection, MediaStream, RTCIceCandidate } from 'react-native-webrtc';
import { firestore } from './firebaseConfig';

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export const createPeerConnection = async (isSource: boolean, localStreamRef: React.MutableRefObject<MediaStream | null>): Promise<RTCPeerConnection> => {
    const peerConnection = new RTCPeerConnection(configuration);

    if (isSource) {
        const stream: MediaStream = await mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
        localStreamRef.current = stream;
    }

    peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
            const candidate = event.candidate.toJSON();
            firestore.collection('candidates').add(candidate);
        }
    });

    return peerConnection;
};

export const addICECandidates = (peerConnection: RTCPeerConnection): void => {
    firestore.collection('candidates').onSnapshot((snapshot: { docChanges: () => any[]; }) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate).catch((error) => console.error('Error adding ICE candidate', error));
            }
        });
    });
};

export const releaseMediaTracks = (stream: MediaStream | null) => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
};
