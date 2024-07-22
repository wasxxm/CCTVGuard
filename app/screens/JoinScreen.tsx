import React from "react";
import WebRTCConnection from "@/components/webrtc/WebRTCConnection";

interface JoinScreenProps {
    roomId: string;
    screens: any;
    setScreen: (screen: string) => void;
}

export default function JoinScreen({ roomId, screens, setScreen }: JoinScreenProps) {
    return <WebRTCConnection roomId={roomId} screens={screens} setScreen={setScreen} isCaller={false} />;
}
