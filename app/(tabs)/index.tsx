import React, { useState } from "react";
import { StyleSheet, Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "../screens/HomeScreen";
import RoomScreen from "../screens/RoomScreen";
import CallScreen from "../screens/CallScreen";
import JoinScreen from "../screens/JoinScreen";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
import { createRoom } from '@/utils/mediasoupClient';

const screens = {
    HOME: "HOME",
    ROOM: "ROOM",
    CALL: "CALL",
    JOIN: "JOIN",
};

export default function App() {
    const [screen, setScreen] = useState(screens.HOME);
    const [previousScreen, setPreviousScreen] = useState<string | null>(null);
    const [roomId, setRoomId] = useState("");
    const [isCCTV, setIsCCTV] = useState(false);

    const navigateTo = (nextScreen: string) => {
        setPreviousScreen(screen);
        setScreen(nextScreen);
    };

    const goBack = () => {
        if (previousScreen) {
            setScreen(previousScreen);
            setPreviousScreen(null);
        }
    };

    const handleCCTVButtonPress = async () => {
        try {
            console.log("Attempting to create room...");
            const newRoomId = await createRoom();
            console.log("Room created with ID:", newRoomId);
            setRoomId(newRoomId);
            setIsCCTV(true);
            navigateTo(screens.ROOM);
        } catch (error) {
            console.error("Error creating room:", error);
        }
    };


    const handleViewerButtonPress = () => {
        setIsCCTV(false);
        navigateTo(screens.ROOM);
    };

    const renderScreen = () => {
        switch (screen) {
            case screens.HOME:
                return <HomeScreen handleCCTVButtonPress={handleCCTVButtonPress} handleViewerButtonPress={handleViewerButtonPress} />;
            case screens.ROOM:
                return <RoomScreen roomId={roomId} setRoomId={setRoomId} screens={screens} setScreen={navigateTo} goBack={goBack} isCCTV={isCCTV} />;
            case screens.CALL:
                return <CallScreen roomId={roomId} screens={screens} setScreen={navigateTo} goBack={goBack} />;
            case screens.JOIN:
                return <JoinScreen roomId={roomId} screens={screens} setScreen={navigateTo} goBack={goBack} />;
            default:
                return <ThemedText>Wrong Screen</ThemedText>;
        }
    };

    return (
        <SafeAreaProvider>
            <ThemedSafeAreaView style={styles.safeArea}>
                {renderScreen()}
            </ThemedSafeAreaView>
        </SafeAreaProvider>
    );
}

const needsExtraPadding = () => Platform.OS === 'android' && StatusBar.currentHeight && StatusBar.currentHeight > 24;
const extraPadding = needsExtraPadding() ? 10 : 0;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + extraPadding : 0,
    },
});
