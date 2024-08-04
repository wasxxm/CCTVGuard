import React from "react";
import { StyleSheet, View, Button, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

interface HomeScreenProps {
    handleCCTVButtonPress: () => void;
    handleViewerButtonPress: () => void;
}

export default function HomeScreen({ handleCCTVButtonPress, handleViewerButtonPress }: HomeScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <ThemedSafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom, paddingTop: insets.top }]}>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title}>Choose Role:</ThemedText>
                <Button title="CCTV" onPress={handleCCTVButtonPress} />
                <Button title="Viewer" onPress={handleViewerButtonPress} />
            </ThemedView>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    },
    container: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
});
