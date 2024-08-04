package com.wazeemkhan.cctvguard.recorder

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.webrtc.VideoTrack

class VideoTrackRegistryModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "VideoTrackRegistry"
    }

    @ReactMethod
    fun addVideoTrack(streamURL: String, track: VideoTrack) {
        VideoTrackRegistry.addVideoTrack(streamURL, track)
    }

    @ReactMethod
    fun removeVideoTrack(streamURL: String) {
        VideoTrackRegistry.removeVideoTrack(streamURL)
    }
}
