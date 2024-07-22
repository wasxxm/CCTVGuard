export interface DeviceInfo {
    deviceId: any;
    kind: string;
    facing: string;
}

export interface RoomData {
    offer?: RTCSessionDescriptionType;
    answer?: RTCSessionDescriptionType;
}

type RTCSessionDescriptionType = {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp: string;
};