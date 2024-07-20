// app/constants/signaling.ts
import { firestore } from './firebaseConfig';
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import {addICECandidates} from "@/constants/WebRTC";

export const createOffer = async (peerConnection: RTCPeerConnection): Promise<void> => {
    const offer = await peerConnection.createOffer({});
    await peerConnection.setLocalDescription(offer);
    const offerData = {
        type: offer.type,
        sdp: offer.sdp,
    };
    await firestore.collection('offers').doc('offer').set(offerData);
};

export const createAnswer = async (peerConnection: RTCPeerConnection, offer: RTCSessionDescription): Promise<void> => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    const answerData = {
        type: answer.type,
        sdp: answer.sdp,
    };
    await firestore.collection('answers').doc('answer').set(answerData);
};

export const listenForOffer = (peerConnection: RTCPeerConnection): void => {
    firestore.collection('offers').doc('offer').onSnapshot(async (snapshot: { data: () => any; }) => {
        const data = snapshot.data();
        if (data && !peerConnection.remoteDescription) {
            const offer = new RTCSessionDescription(data);
            await peerConnection.setRemoteDescription(offer);
            addICECandidates(peerConnection);
        }
    });
};

export const listenForAnswer = (peerConnection: RTCPeerConnection): void => {
    firestore.collection('answers').doc('answer').onSnapshot(async (snapshot: { data: () => any; }) => {
        const data = snapshot.data();
        if (data && !peerConnection.localDescription) {
            const answer = new RTCSessionDescription(data);
            await peerConnection.setRemoteDescription(answer);
            addICECandidates(peerConnection);
        }
    });
};
