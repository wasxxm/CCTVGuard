import React, { useState, useEffect } from "react";
import { View } from "react-native";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
    MediaStreamTrack,
} from "react-native-webrtc";
import { db } from "@/config/firebaseConfig";
import {
    addDoc,
    collection,
    doc,
    getDoc,
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

interface JoinScreenProps {
    roomId: string;
    screens: any;
    setScreen: any;
}

export default function JoinScreen({ roomId, screens, setScreen}: JoinScreenProps) {
    const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined);
    const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>(undefined);
    const [cachedLocalPC, setCachedLocalPC] = useState<RTCPeerConnection | null>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);

    useEffect(() => {
        startLocalStream();
    }, []);

    useEffect(() => {
        if (localStream) {
            joinCall(roomId);
        }
    }, [localStream]);

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
            (device) => device.kind === "videoinput" && device.facing === facing
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

    const joinCall = async (id: string) => {
        const roomRef = doc(db, "room", id);
        const roomSnapshot = await getDoc(roomRef);

        if (!roomSnapshot.exists) return;
        const localPC = new RTCPeerConnection(configuration);
        localStream?.getTracks().forEach((track) => {
            localPC.addTrack(track, localStream);
        });

        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

        localPC.addEventListener("icecandidate", (e) => {
            if (!e.candidate) {
                console.log("Got final candidate!");
                return;
            }
            addDoc(calleeCandidatesCollection, e.candidate.toJSON());
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

        // Check if roomSnapshot.data() is defined before accessing its properties
        const roomData = roomSnapshot.data();
        if (!roomData) {
            // Handle the case where roomData is undefined
            console.error("Room data is undefined.");
            return;
        }

        const offer = roomData.offer;

        await localPC.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await localPC.createAnswer();
        await localPC.setLocalDescription(answer);

        await updateDoc(roomRef, { answer, connected: true });

        const unsubscribeCallerCandidates = onSnapshot(callerCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    let data = change.doc.data();
                    localPC.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });

        const unsubscribeRoom = onSnapshot(roomRef, (doc) => {
            const data = doc.data();
            if (data && !data.answer) {
                setScreen(screens.ROOM);
            }
        });

        setCachedLocalPC(localPC);
    };

    const switchCamera = () => {
        localStream?.getVideoTracks().forEach((track) => track._switchCamera());
    };

    const toggleMute = () => {
        localStream?.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };

    const toggleCamera = () => {
        localStream?.getVideoTracks().forEach((track) => {
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

        const roomRef = doc(db, "room", roomId);
        await updateDoc(roomRef, { answer: deleteField(), connected: false });

        releaseMediaTracks(localStream);
        setLocalStream(undefined);
        setRemoteStream(undefined);
        setCachedLocalPC(null);
        setScreen(screens.ROOM);
    };

    return (
        <View style={tw`flex-1`}>
            <RTCView
                style={tw`flex-1`}
                streamURL={remoteStream && remoteStream.toURL()}
                objectFit={"cover"}
            />

            {remoteStream && !isOffCam && (
                <RTCView
                    style={tw`w-32 h-48 absolute right-6 top-8`}
                    streamURL={localStream && localStream.toURL()}
                />
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
