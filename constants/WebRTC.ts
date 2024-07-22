import { mediaDevices, RTCPeerConnection, MediaStream, RTCIceCandidate } from 'react-native-webrtc';
import { candidatesCollection } from '@/services/collections';
import { addDoc, onSnapshot } from 'firebase/firestore';

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export const createPeerConnection = async (isSource: boolean, localStreamRef: React.MutableRefObject<MediaStream | null>): Promise<RTCPeerConnection> => {
    const peerConnection = new RTCPeerConnection(configuration);

    if (isSource) {
        const stream: MediaStream = await mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
        localStreamRef.current = stream;
    }

    peerConnection.addEventListener('icecandidate', async (event) => {
        if (event.candidate) {
            const candidate = event.candidate.toJSON();
            await addDoc(candidatesCollection, { candidate });
        }
    });

    return peerConnection;
};

export const addICECandidates = (peerConnection: RTCPeerConnection): void => {
    onSnapshot(candidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data().candidate);
                peerConnection.addIceCandidate(candidate).catch((error) => console.error('Error adding ICE candidate', error));
            }
        });
    });
};

export const releaseMediaTracks = (stream: MediaStream | undefined) => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
};
