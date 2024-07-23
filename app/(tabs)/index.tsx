import React, { useState } from "react";
import { StyleSheet, Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RoomScreen from "@/app/screens/RoomScreen";
import CallScreen from "@/app/screens/CallScreen";
import JoinScreen from "@/app/screens/JoinScreen";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

const screens = {
    ROOM: "JOIN_ROOM",
    CALL: "CALL",
    JOIN: "JOIN",
};

export default function HomeScreen() {
    const [screen, setScreen] = useState(screens.ROOM);
    const [roomId, setRoomId] = useState("");

    const insets = useSafeAreaInsets();

    const renderScreen = () => {
        switch (screen) {
            case screens.ROOM:
                return <RoomScreen roomId={roomId} setRoomId={setRoomId} screens={screens} setScreen={setScreen} />;
            case screens.CALL:
                return <CallScreen roomId={roomId} screens={screens} setScreen={setScreen} />;
            case screens.JOIN:
                return <JoinScreen roomId={roomId} screens={screens} setScreen={setScreen} />;
            default:
                return <ThemedText>Wrong Screen</ThemedText>;
        }
    };

    return (
        <ThemedSafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom, paddingTop: insets.top }]}>
            <ThemedView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "gray" }}>
                {renderScreen()}
            </ThemedView>
        </ThemedSafeAreaView>
    );
}

const needsExtraPadding = () => Platform.OS === 'android' && StatusBar.currentHeight && StatusBar.currentHeight > 24;
const extraPadding = needsExtraPadding() ? 10 : 0;

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + extraPadding : 0,
    },
});
