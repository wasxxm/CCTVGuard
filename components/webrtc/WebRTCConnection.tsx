import React, { useState, useEffect, useRef } from "react";
import { Dimensions, View } from "react-native";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
} from "react-native-webrtc";
import DeviceInfo from "react-native-device-info";
import { db } from "@/config/firebaseConfig";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    updateDoc,
    onSnapshot,
    deleteField, setDoc,
} from "firebase/firestore";
import tw from "twrnc";
import { releaseMediaTracks } from "@/constants/WebRTC";
import { DeviceInfo as DeviceInfoRTC, RoomData } from "@/types/shared";
import CallActionBox from "@/components/CallActionBox";
import { RTCRtpSendParametersInit } from "react-native-webrtc/src/RTCRtpSendParameters";
import { ThemedView } from "@/components/ThemedView";

const configuration = {
    iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
    ],
    iceCandidatePoolSize: 10,
};

interface WebRTCConnectionProps {
    roomId: string;
    screens: any;
    setScreen: (screen: string) => void;
    isCaller: boolean;
}

export default function WebRTCConnection({ roomId, screens, setScreen, isCaller }: WebRTCConnectionProps) {
    const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined);
    const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>(undefined);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);

    useEffect(() => {
        startLocalStream();
        return () => {
            endCall();
        };
    }, []);

    useEffect(() => {
        if (localStream) {
            handleConnection(roomId);
        }
    }, [localStream]);

    useEffect(() => {
        if (peerConnection) {
            const interval = setInterval(() => {
                adjustBitrate();
            }, 5000); // Adjust bitrate every 5 seconds

            return () => clearInterval(interval);
        }
    }, [peerConnection]);

    const startLocalStream = async () => {
        const devices = await mediaDevices.enumerateDevices() as DeviceInfoRTC[];
        const videoSourceId = devices.find(device => device.kind === "videoinput" && device.facing === "front");
        const constraints = {
            audio: true,
            video: {
                mandatory: {
                    minWidth: 500,
                    minHeight: 300,
                    minFrameRate: 30,
                },
                facingMode: "user",
                optional: videoSourceId ? [{ sourceId: videoSourceId.deviceId }] : [],
            },
        };
        const newStream = await mediaDevices.getUserMedia(constraints);
        setLocalStream(newStream);
    };

    const handleConnection = async (roomId: string) => {
        const roomRef = doc(db, "room", roomId);
        const roomSnapshot = await getDoc(roomRef);

        if (!roomSnapshot.exists()) {
            console.log("Room does not exist. Creating a new room.");
            await setDoc(roomRef, {}); // Ensure a room document is created if it does not exist
        } else {
            console.log("Room exists. Joining the existing room.");
        }

        const pc = new RTCPeerConnection(configuration);
        localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));

        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

        pc.addEventListener("icecandidate", (e) => {
            if (e.candidate) {
                addDoc(isCaller ? callerCandidatesCollection : calleeCandidatesCollection, e.candidate.toJSON());
            }
        });

        pc.addEventListener("track", (e) => {
            if (e.streams && e.streams[0]) {
                const newStream = new MediaStream();
                e.streams[0].getTracks().forEach((track) => {
                    newStream.addTrack(track);
                });
                setRemoteStream(newStream);
            }
        });

        setPeerConnection(pc);

        if (isCaller) {
            await createOffer(pc, roomRef);
        } else {
            await answerCall(pc, roomRef);
        }

        onSnapshot(roomRef, doc => {
            const data = doc.data() as RoomData;
            if (data?.answer && !pc.currentRemoteDescription) {
                pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        onSnapshot(isCaller ? calleeCandidatesCollection : callerCandidatesCollection, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            });
        });
    };


    const createOffer = async (pc: RTCPeerConnection, roomRef: any) => {
        const offer = await pc.createOffer({});
        await pc.setLocalDescription(offer);
        await updateDoc(roomRef, { offer });
    };

    const answerCall = async (pc: RTCPeerConnection, roomRef: any) => {
        const roomSnapshot = await getDoc(roomRef);

        const roomData = roomSnapshot.data() as RoomData;
        if (!roomData) {
            console.error("Room data is undefined.");
            return;
        }

        const offer = roomData.offer;

        if (offer) {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(roomRef, { answer });
        }
    };

    const adjustBitrate = async () => {
        if (!peerConnection) return;

        const senders = peerConnection.getSenders();
        const videoSender = senders.find(sender => sender.track?.kind === "video");

        if (videoSender) {
            const _parameters = videoSender.getParameters();

            const parameters = {
                ..._parameters,
                encodings: _parameters.encodings || [{}],
                toJSON: (): RTCRtpSendParametersInit => {
                    return _parameters.toJSON();
                },
            };

            // Monitor network conditions and adjust bitrate accordingly
            const track = videoSender.track;
            if (!track) return;

            const stats = await peerConnection.getStats(track);
            for (const report of stats) {
                // console.log("Report type:", report);
                if (report.type === "outbound-rtp" && report.kind === "video") {
                    const currentBitrate = (report.bytesSent * 8) / (report.timestamp / 1000); // Convert to bits per second

                    // Ensure the maxBitrate does not exceed the dynamically calculated maximum
                    parameters.encodings[0].maxBitrate = await calculateDynamicMaxBitrate(currentBitrate);

                    await videoSender.setParameters(parameters);
                }
            }
        }
    };

    async function calculateDynamicMaxBitrate(currentBitrate: number): Promise<number> {
        // Get device screen resolution
        const { width, height } = Dimensions.get('window');
        const screenArea = width * height;

        // Placeholder for CPU performance factor (simple heuristic)
        const cpuPerformanceFactor = 1; // This could be derived from device model or benchmark data

        // Get battery level and charging status
        let batteryLevel = 1; // Assume full battery if unable to get battery status
        let isCharging = true; // Assume charging if unable to get battery status

        try {
            batteryLevel = await DeviceInfo.getBatteryLevel();
            isCharging = await DeviceInfo.isBatteryCharging();
        } catch (e) {
            console.warn("Unable to get battery status:", e);
        }

        // Adjust based on device screen resolution
        const screenFactor = screenArea / (1920 * 1080); // Base factor for full HD resolution

        // Adjust based on battery level
        const batteryFactor = isCharging ? 1 : batteryLevel;

        // Base bitrate settings adjusted for various factors
        const baseBitrateLevels = [
            { maxBitrate: 100000, condition: (bitrate: number) => bitrate < 150000 }, // 100kbps for very low network speed
            { maxBitrate: 150000, condition: (bitrate: number) => bitrate < 300000 }, // 150kbps for low network speed
            { maxBitrate: 300000, condition: (bitrate: number) => bitrate >= 300000 && bitrate < 500000 }, // 300kbps for moderate network speed
            { maxBitrate: 500000, condition: (bitrate: number) => bitrate >= 500000 && bitrate < 700000 }, // 500kbps for high network speed
            { maxBitrate: 800000, condition: (bitrate: number) => bitrate >= 700000 && bitrate < 1000000 }, // 800kbps for very high network speed
            { maxBitrate: 1200000, condition: (bitrate: number) => bitrate >= 1000000 && bitrate < 1500000 }, // 1200kbps for excellent network speed
            { maxBitrate: 2000000, condition: (bitrate: number) => bitrate >= 1500000 }, // 2000kbps for ultra-fast network speed
        ];

        // Find the appropriate base max bitrate based on current network speed
        const baseMaxBitrate = baseBitrateLevels.find(level => level.condition(currentBitrate))?.maxBitrate || 1000000;

        // Calculate dynamic max bitrate
        const dynamicMaxBitrate = baseMaxBitrate * screenFactor * batteryFactor * cpuPerformanceFactor;

        return Math.min(currentBitrate, dynamicMaxBitrate);
    }


    const switchCamera = () => localStream?.getVideoTracks().forEach(track => track._switchCamera());
    const toggleMute = () => localStream?.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
    });
    const toggleCamera = () => localStream?.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsOffCam(!track.enabled);
    });


    const endCall = async () => {
        if (peerConnection) {
            peerConnection.getSenders().forEach(sender => peerConnection.removeTrack(sender));
            peerConnection.close();
            setPeerConnection(null);
        }

        // Check if the room document exists before attempting to update it
        const roomRef = doc(db, "room", roomId);
        const roomSnapshot = await getDoc(roomRef);

        if (roomSnapshot.exists()) {
            await updateDoc(roomRef, { answer: deleteField(), connected: false });
        } else {
            console.warn(`No room document found for roomId: ${roomId}`);
        }

        releaseMediaTracks(localStream);
        setLocalStream(undefined);
        setRemoteStream(undefined);
        setScreen(screens.ROOM);
    };


    return (
        <ThemedView style={tw`w-full`}>
            <RTCView style={tw`h-64`} streamURL={remoteStream?.toURL()} objectFit="cover" />
            {!isOffCam && <RTCView style={tw`h-64 top-8`} streamURL={localStream?.toURL()} />}
            <ThemedView style={tw``}>
                <CallActionBox switchCamera={switchCamera} toggleMute={toggleMute} toggleCamera={toggleCamera} endCall={endCall} />
            </ThemedView>
        </ThemedView>
    );
}
