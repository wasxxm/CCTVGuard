import React, { useState, useEffect } from "react";
import { View, Button } from "react-native";
import { RTCView, MediaStream } from "react-native-webrtc";
import tw from "twrnc";
import { ThemedView } from "@/components/ThemedView";
import { startStream, endCall, joinRoom } from '@/utils/mediasoupClient';

const WebRTCConnection: React.FC<{ roomId: string; screens: any; setScreen: (screen: string) => void; isCaller: boolean }> = ({ roomId, screens, setScreen, isCaller }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (isCaller) {
            startLocalStream();
        } else {
            joinRoom(roomId);
        }

        return () => {
            endCall();
        };
    }, []);

    const startLocalStream = async () => {
        const stream = await startStream();
        setLocalStream(stream);
    };

    const handleEndCall = () => {
        endCall();
        setLocalStream(null);
        setRemoteStream(null);
        setScreen(screens.ROOM);
    };

    return (
        <ThemedView style={tw`w-full h-full`}>
            <RTCView style={tw`h-1/3`} streamURL={remoteStream?.toURL()} objectFit="cover" />
            <RTCView style={tw`h-1/3`} streamURL={localStream?.toURL()} objectFit="cover" />
            <View style={tw`bottom-0 w-full flex-row justify-around p-4 z-1`}>
                <Button title="End Call" onPress={handleEndCall} />
            </View>
        </ThemedView>
    );
};

export default WebRTCConnection;
