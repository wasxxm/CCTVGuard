import {Image, StyleSheet, Platform, View, Button} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {useEffect, useRef, useState} from "react";
import tw from 'twrnc';
import React from 'react';
import RoomScreen from "@/app/screens/RoomScreen";
import CallScreen from "@/app/screens/CallScreen";
import JoinScreen from "@/app/screens/JoinScreen";

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


    return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
        <View style={tw`h-100 w-80 justify-center items-center bg-gray-100`}>
            {content}
        </View>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
    video: {
        width: '100%',
        height: '100%',
    },
});
