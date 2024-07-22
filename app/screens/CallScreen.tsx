import React, { useState, useEffect } from "react";
import { View } from "react-native";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
} from "react-native-webrtc";
import { db } from "@/config/firebaseConfig";
import {
    addDoc,
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    deleteField,
} from "firebase/firestore";
import CallActionBox from "@/components/CallActionBox";
import tw from "twrnc";
import { releaseMediaTracks } from "@/constants/WebRTC";
import { DeviceInfo } from "@/types/shared";

const configuration = {
    iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
    ],
    iceCandidatePoolSize: 10,
};

interface CallScreenProps {
    roomId: string;
    screens: { [key: string]: string };
    setScreen: (screenName: string) => void;
}

export default function CallScreen({ roomId, screens, setScreen }: CallScreenProps) {
    const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined);
    const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>(undefined);
    const [cachedLocalPC, setCachedLocalPC] = useState<RTCPeerConnection | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isOffCam, setIsOffCam] = useState<boolean>(false);
    const [unsubscribeCallerCandidates, setUnsubscribeCallerCandidates] = useState<(() => void) | null>(null);
    const [unsubscribeCalleeCandidates, setUnsubscribeCalleeCandidates] = useState<(() => void) | null>(null);
    const [unsubscribeRoom, setUnsubscribeRoom] = useState<(() => void) | null>(null);

    useEffect(() => {
        startLocalStream();
    }, []);

    useEffect(() => {
        if (localStream && roomId) {
            startCall(roomId);
        }
    }, [localStream, roomId]);

    useEffect(() => {
        return () => {
            endCall();
        };
    }, []);

    const startLocalStream = async () => {
        const isFront = true;
        const devices = await mediaDevices.enumerateDevices() as DeviceInfo[];

        const facing = isFront ? "front" : "environment";
        const videoSourceId = devices.find(
            (device: { kind: string; facing: string; }) => device.kind === "videoinput" && device.facing === facing
        );
        const facingMode = isFront ? "user" : "environment";
        const constraints = {
            audio: true,
            video: {
                mandatory: {
                    minWidth: 500,
                    minHeight: 300,
                    minFrameRate: 30,
                },
                facingMode,
                optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
        };
        const newStream = await mediaDevices.getUserMedia(constraints);
        setLocalStream(newStream);
    };

    const startCall = async (id: string) => {
        const localPC = new RTCPeerConnection(configuration);

        if (localStream && localStream.getTracks().length > 0) {
            localStream.getTracks().forEach((track) => {
                localPC.addTrack(track, localStream);
            });
        } else {
            console.log('localStream is not initialized or contains no tracks');
        }

        const roomRef = doc(db, "room", id);
        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

        localPC.addEventListener("icecandidate", (e) => {
            if (!e.candidate) {
                console.log("Got final candidate!");
                return;
            }
            addDoc(callerCandidatesCollection, e.candidate.toJSON());
        });

        localPC.addEventListener("track", (e) => {
            if (e.streams && e.streams[0]) {
                const newStream = new MediaStream();
                e.streams[0].getTracks().forEach((track) => {
                    newStream.addTrack(track);
                });
                setRemoteStream(newStream);
            }
        });

        const offerOptions = {}; // Define offer options if needed
        const offer = await localPC.createOffer(offerOptions);
        await localPC.setLocalDescription(offer);

        await setDoc(roomRef, { offer, connected: false }, { merge: true });

        const roomUnsubscribe = onSnapshot(roomRef, (doc) => {
            const data = doc.data();
            if (!localPC.currentRemoteDescription && data?.answer) {
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                localPC.setRemoteDescription(rtcSessionDescription);
            } else if (!data?.answer) {
                setRemoteStream(undefined);
            }
        });

        const calleeCandidatesUnsubscribe = onSnapshot(calleeCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    let data = change.doc.data();
                    localPC.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });

        setCachedLocalPC(localPC);
        setUnsubscribeCallerCandidates(() => roomUnsubscribe);
        setUnsubscribeCalleeCandidates(() => calleeCandidatesUnsubscribe);
        setUnsubscribeRoom(() => roomUnsubscribe);
    };

    const switchCamera = () => {
        localStream?.getVideoTracks().forEach((track: { _switchCamera: () => any; }) => track._switchCamera());
    };

    const toggleMute = () => {
        if (!remoteStream) {
            return;
        }
        localStream?.getAudioTracks().forEach((track: { enabled: boolean; }) => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };

    const toggleCamera = () => {
        localStream?.getVideoTracks().forEach((track: { enabled: boolean; }) => {
            track.enabled = !track.enabled;
            setIsOffCam(!isOffCam);
        });
    };

    const endCall = async () => {
        if (cachedLocalPC) {
            const senders = cachedLocalPC.getSenders();
            senders.forEach((sender) => {
                cachedLocalPC.removeTrack(sender);
            });
            cachedLocalPC.close();
        }

        if (unsubscribeCallerCandidates) unsubscribeCallerCandidates();
        if (unsubscribeCalleeCandidates) unsubscribeCalleeCandidates();
        if (unsubscribeRoom) unsubscribeRoom();

        const roomRef = doc(db, "room", roomId);
        await updateDoc(roomRef, { answer: deleteField() });

        releaseMediaTracks(localStream);
        setLocalStream(undefined);
        setRemoteStream(undefined);
        setCachedLocalPC(null);
        setScreen(screens.ROOM);
    };

    return (
        <View style={tw`h-100 w-80 bg-red-600`}>
            {!remoteStream && (
                <>
                    <RTCView
                        style={tw`h-100 w-80`}
                        streamURL={localStream && localStream.toURL()}
                        objectFit={"cover"}
                    />
                </>
            )}

            {remoteStream && (
                <>
                    <RTCView
                        style={tw`h-100`}
                        streamURL={remoteStream && remoteStream.toURL()}
                        objectFit={"cover"}
                    />
                    {!isOffCam && (
                        <RTCView
                            style={tw`w-32 h-48 absolute right-6 top-8`}
                            streamURL={localStream && localStream.toURL()}
                        />
                    )}
                </>
            )}
            <View style={tw`absolute bottom-0 w-full`}>
                <CallActionBox
                    switchCamera={switchCamera}
                    toggleMute={toggleMute}
                    toggleCamera={toggleCamera}
                    endCall={endCall}
                />
            </View>
        </View>
    );
}
