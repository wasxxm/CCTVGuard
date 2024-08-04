package com.wazeemkhan.cctvguard.recorder

import android.view.SurfaceView
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import org.webrtc.*

class WebRTCViewManager : SimpleViewManager<SurfaceView>() {

    private val TAG = "WebRTCViewManager"
    private val eglBase: EglBase = EglBase.create()
    private var surfaceViewRenderer: SurfaceViewRenderer? = null

    override fun getName(): String {
        return "WebRTCView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): SurfaceView {
        surfaceViewRenderer = SurfaceViewRenderer(reactContext)
        surfaceViewRenderer?.init(eglBase.eglBaseContext, null)
        surfaceViewRenderer?.setMirror(true)
        surfaceViewRenderer?.setZOrderMediaOverlay(true)
        return surfaceViewRenderer as SurfaceView
    }

    @ReactProp(name = "streamURL")
    fun setStreamURL(view: SurfaceView, streamURL: String) {
        // Assuming streamURL is the identifier for the video track
        val videoTrack = getVideoTrackFromStreamURL(streamURL)

        // Start rendering the VideoTrack
        videoTrack?.addSink(surfaceViewRenderer)
    }

    private fun getVideoTrackFromStreamURL(streamURL: String): VideoTrack? {
        // This function should get the VideoTrack corresponding to the streamURL
        // You need to implement this method based on how you manage the video tracks
        // This is just a placeholder implementation
        return VideoTrackRegistry.getVideoTrack(streamURL)
    }
}
