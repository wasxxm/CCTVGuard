import { NativeModules } from 'react-native';
const { VideoRecorder } = NativeModules;

export async function initSurface(surfaceId: number): Promise<void> {
    try {
        await VideoRecorder.initSurface(surfaceId);
    } catch (error) {
        console.error("Failed to initialize surface", error);
    }
}

export async function startRecording(path: string): Promise<void> {
    try {
        const result = await VideoRecorder.startRecording(path);
        console.log(result);
    } catch (error) {
        console.error("Failed to start recording", error);
    }
}

export async function stopRecording(): Promise<string> {
    try {
        const result = await VideoRecorder.stopRecording();
        console.log(result);
        return result;
    } catch (error) {
        console.error("Failed to stop recording", error);
        throw error;
    }
}
