import React from "react";
import WebRTCConnection from "@/components/webrtc/WebRTCConnection";

interface CallScreenProps {
    roomId: string;
    screens: any;
    setScreen: (screen: string) => void;
}

export default function CallScreen({ roomId, screens, setScreen }: CallScreenProps) {
    return <WebRTCConnection roomId={roomId} screens={screens} setScreen={setScreen} isCaller={true} />;
}
