package com.wazeemkhan.cctvguard.recorder

import org.webrtc.VideoTrack

object VideoTrackRegistry {
    private val videoTrackMap: MutableMap<String, VideoTrack> = mutableMapOf()

    fun addVideoTrack(streamURL: String, videoTrack: VideoTrack) {
        videoTrackMap[streamURL] = videoTrack
    }

    fun getVideoTrack(streamURL: String): VideoTrack? {
        return videoTrackMap[streamURL]
    }

    fun removeVideoTrack(streamURL: String) {
        videoTrackMap.remove(streamURL)
    }
}
