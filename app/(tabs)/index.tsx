import {Image, StyleSheet, Platform, View, Button, StatusBar} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {useEffect, useRef, useState} from "react";
import tw from 'twrnc';
import React from 'react';
import RoomScreen from "@/app/screens/RoomScreen";
import CallScreen from "@/app/screens/CallScreen";
import JoinScreen from "@/app/screens/JoinScreen";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';

export default function HomeScreen() {

    const screens = {
        ROOM: "JOIN_ROOM",
        CALL: "CALL",
        JOIN: "JOIN",
    };

    const [screen, setScreen] = useState(screens.ROOM);
    const [roomId, setRoomId] = useState("");

    let content;

    switch (screen) {
        case screens.ROOM:
            content = (
                <RoomScreen
                    roomId={roomId}
                    setRoomId={setRoomId}
                    screens={screens}
                    setScreen={setScreen}
                />
            );
            break;

        case screens.CALL:
            content = (
                <CallScreen roomId={roomId} screens={screens} setScreen={setScreen} />
            );
            break;

        case screens.JOIN:
            content = (
                <JoinScreen roomId={roomId} screens={screens} setScreen={setScreen} />
            );
            break;

        default:
            content = <ThemedText>Wrong Screen</ThemedText>;
    }

    const insets = useSafeAreaInsets();

    return (
        <ThemedSafeAreaView style={[styles.safeArea, tw`flex-1`]}>
            <ThemedView style={[
                    tw`justify-center items-center bg-gray-100`,
                    { paddingBottom: insets.bottom, paddingTop: insets.top },
                ]}>
                {content}
            </ThemedView>
        </ThemedSafeAreaView>
  );
}

// Function to determine if additional padding is needed
const needsExtraPadding = () => {
    return Platform.OS === 'android' && StatusBar.currentHeight && StatusBar.currentHeight > 24;
};

// Calculate additional padding if needed
const extraPadding = needsExtraPadding() ? 10 : 0;

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + extraPadding : 0,
    },
});
