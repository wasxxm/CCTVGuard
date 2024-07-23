// app/components/CallActionBox.tsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import tw from 'twrnc';
import {ThemedView} from "@/components/ThemedView";

interface CallActionBoxProps {
    switchCamera: () => void;
    toggleMute: () => void;
    toggleCamera: () => void;
    endCall: () => void;
}

const CallActionBox: React.FC<CallActionBoxProps> = ({ switchCamera, toggleMute, toggleCamera, endCall }) => {
    return (
        <ThemedView style={tw`flex-col h-50 justify-around bg-gray-800 p-4`}>
            <Button title="Switch Camera" onPress={switchCamera} />
            <Button title="Mute" onPress={toggleMute} />
            <Button title="Toggle Camera" onPress={toggleCamera} />
            <Button title="End Call" onPress={endCall} />
        </ThemedView>
    );
};

export default CallActionBox;
