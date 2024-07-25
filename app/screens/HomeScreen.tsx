import React from "react";
import {StyleSheet, View, Button, Platform, StatusBar} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

const screens = {
    ROOM: "JOIN_ROOM",
};

interface HomeScreenProps {
    setScreen: (screen: string) => void;
    setIsCCTV: (isCCTV: boolean) => void;
}

export default function HomeScreen({ setScreen, setIsCCTV }: HomeScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <ThemedSafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom, paddingTop: insets.top }]}>
            <ThemedView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "gray" }}>
                <ThemedText>Choose Role:</ThemedText>
                <Button title="CCTV" onPress={() => { setIsCCTV(true); setScreen(screens.ROOM); }} />
                <Button title="Viewer" onPress={() => { setIsCCTV(false); setScreen(screens.ROOM); }} />
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
