// Import the module for its side effects, ensuring TypeScript loads its types.
import 'react-native-webrtc';

// Extend the global module declaration
declare module 'react-native-webrtc' {
    // Extend RTCPeerConnection without overriding existing definitions
    interface RTCPeerConnection {
        currentRemoteDescription: RTCSessionDescription | null;
    }
}

export interface RTCRtpSendParameters {
    encodings?: RTCRtpEncodingParameters[];
    headerExtensions?: RTCRtpHeaderExtensionParameters[];
    rtcp?: RTCRtcpParameters;
    codecs: RTCRtpCodecParameters[];
    transactionId: string;
}

export interface RTCRtpEncodingParameters {
    ssrc?: number;
    codecPayloadType?: number;
    dtx?: 'disabled' | 'enabled';
    active: boolean;
    priority?: RTCPriorityType;
    maxBitrate?: number;
    maxFramerate?: number;
    rid?: string;
    scaleResolutionDownBy?: number;
}

export interface RTCRtpHeaderExtensionParameters {
    uri: string;
    id: number;
    encrypted?: boolean;
}

export interface RTCRtcpParameters {
    cname: string;
    reducedSize?: boolean;
    mux?: boolean;
}

export interface RTCRtpCodecParameters {
    mimeType: string;
    clockRate: number;
    channels?: number;
    sdpFmtpLine?: string;
    payloadType: number;
}

export interface RTCIceParameters {
    usernameFragment: string;
    password: string;
    iceLite?: boolean;
}

export interface RTCDtlsParameters {
    role?: RTCDtlsRole;
    fingerprints: RTCDtlsFingerprint[];
}

export type RTCDtlsRole = 'auto' | 'client' | 'server';

export interface RTCDtlsFingerprint {
    algorithm: string;
    value: string;
}

export interface CustomRTCIceCandidateInit {
    candidate: string;
    sdpMid?: string;
    sdpMLineIndex?: number;
    usernameFragment?: string;
}

export interface TransportOptions {
    id: string;
    iceParameters: RTCIceParameters;
    iceCandidates: CustomRTCIceCandidateInit[];
    dtlsParameters: RTCDtlsParameters;
    transportId: string;
}