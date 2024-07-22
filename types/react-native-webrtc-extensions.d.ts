// Import the module for its side effects, ensuring TypeScript loads its types.
import 'react-native-webrtc';

// Extend the global module declaration
declare module 'react-native-webrtc' {
    // Extend RTCPeerConnection without overriding existing definitions
    interface RTCPeerConnection {
        currentRemoteDescription: RTCSessionDescription | null;
    }
}