import {Image, StyleSheet, Platform, View, Button} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {useEffect, useRef, useState} from "react";

import { RTCView } from 'react-native-webrtc';
import { createPeerConnection, addICECandidates } from '@/constants/WebRTC';
import { createOffer, createAnswer, listenForOffer, listenForAnswer } from '@/constants/signaling';
import tw from 'twrnc';

export default function HomeScreen() {
    const [isSource, setIsSource] = useState(false);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                peerConnection.current = await createPeerConnection(isSource);
                if (isSource) {
                    listenForAnswer(peerConnection.current);
                } else {
                    listenForOffer(peerConnection.current);
                    peerConnection.current.addEventListener('track', (event) => {
                        setStreamUrl(event.streams[0].toURL());
                    });
                }
                addICECandidates(peerConnection.current);
            } catch (err) {
                setError('Failed to initialize WebRTC');
            }
        };
        init();
    }, [isSource]);

    const startCall = async () => {
        if (isSource) {
            await createOffer(peerConnection.current!);
        }
    };


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
        <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
            <View style={tw`flex-row`}>
                <Button title="Switch to Source" onPress={() => setIsSource(true)} />
                <Button title="Switch to Viewer" onPress={() => setIsSource(false)} />
            </View>
            <Button title="Start Call" onPress={startCall} />
            {streamUrl && <RTCView streamURL={streamUrl} style={tw`w-full h-full`} />}
            {error && <Text style={tw`text-red-500`}>{error}</Text>}
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
