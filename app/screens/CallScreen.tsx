import React from "react";
import { Button } from "react-native";
import WebRTCConnection from "@/components/webrtc/WebRTCConnection";
import { ThemedView } from "@/components/ThemedView";
import {Call} from "@grpc/grpc-js";

interface CallScreenProps {
    roomId: string;
    screens: { [key: string]: string };
    setScreen: (screen: string) => void;
    goBack: () => void;
}

const CallScreen = ({ roomId, screens, setScreen, goBack }: CallScreenProps) => {
    return (
        <ThemedView>
            <Button title="Back" onPress={goBack} />
            <WebRTCConnection roomId={roomId} screens={screens} setScreen={setScreen} isCaller={true} />
        </ThemedView>
    );
}

export default CallScreen;
