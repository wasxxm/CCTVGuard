import React from "react";
import { Button } from "react-native";
import WebRTCConnection from "@/components/webrtc/WebRTCConnection";
import { ThemedView } from "@/components/ThemedView";

interface JoinScreenProps {
    roomId: string;
    screens: { [key: string]: string };
    setScreen: (screen: string) => void;
    goBack: () => void;
}

const JoinScreen = ({ roomId, screens, setScreen, goBack } : JoinScreenProps) => {
    return (
        <ThemedView>
            <Button title="Back" onPress={goBack} />
            <WebRTCConnection roomId={roomId} screens={screens} setScreen={setScreen} isCaller={false} />
        </ThemedView>
    );
}

export default JoinScreen;
