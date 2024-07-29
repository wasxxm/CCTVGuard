import React, { useState, useEffect } from 'react';
import { Button, NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { MediaStream } from 'react-native-webrtc';
import storage from '@react-native-firebase/storage';
import { ThemedView } from "@/components/ThemedView";

const { RecorderModule } = NativeModules;
const recorderEventEmitter = new NativeEventEmitter(RecorderModule);

interface RecorderProps {
    localStream: MediaStream | undefined;
}

const Recorder: React.FC<RecorderProps> = ({ localStream }) => {
    const [recording, setRecording] = useState(false);

    useEffect(() => {
        const subscription = recorderEventEmitter.addListener('chunkAvailable', handleChunkAvailable);
        return () => subscription.remove();
    }, []);

    const handleChunkAvailable = async (filePath: string) => {
        await uploadToFirebaseStorage(filePath);
    };

    const startRecording = () => {
        if (Platform.OS === 'android') {
            RecorderModule.startRecording();
        }
        setRecording(true);
    };

    const stopRecording = async () => {
        if (Platform.OS === 'android') {
            const outputPath: string = await RecorderModule.stopRecording();
            await uploadToFirebaseStorage(outputPath);
        }
        setRecording(false);
    };

    const uploadToFirebaseStorage = async (filePath: string) => {
        console.log('Uploading file to Firebase Storage:', filePath);
        const fileUri = Platform.OS === 'android' ? `file://${filePath}` : filePath;
        const fileName = filePath.split('/').pop()!;
        const reference = storage().ref(`videos/${fileName}`);
        await reference.putFile(fileUri);
        const url = await reference.getDownloadURL();
        console.log('File available at', url);
    };

    return (
        <ThemedView>
            <Button title="Start Recording" onPress={startRecording} disabled={recording} />
            <Button title="Stop Recording" onPress={stopRecording} disabled={!recording} />
        </ThemedView>
    );
};

export default Recorder;