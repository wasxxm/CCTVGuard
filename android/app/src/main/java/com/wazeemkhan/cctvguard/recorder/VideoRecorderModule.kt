package com.wazeemkhan.cctvguard.recorder

import android.media.MediaRecorder
import android.view.SurfaceView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.IOException

class VideoRecorderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var mediaRecorder: MediaRecorder? = null
    private var outputPath: String? = null
    private var surfaceView: SurfaceView? = null

    override fun getName(): String {
        return "VideoRecorder"
    }

    @ReactMethod
    fun initSurface(surfaceId: Int) {
        val activity = currentActivity ?: return
        surfaceView = activity.findViewById(surfaceId)
    }

    @ReactMethod
    fun startRecording(path: String, promise: Promise) {
        outputPath = path
        mediaRecorder = MediaRecorder()
        mediaRecorder?.apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setVideoSource(MediaRecorder.VideoSource.SURFACE)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setOutputFile(outputPath)
            setVideoEncoder(MediaRecorder.VideoEncoder.H264)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setPreviewDisplay(surfaceView?.holder?.surface)
            try {
                prepare()
                start()
                promise.resolve("Recording started")
            } catch (e: IOException) {
                promise.reject("START_FAILED", "Failed to start recording", e)
            }
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            promise.resolve(outputPath)
        } catch (e: Exception) {
            promise.reject("STOP_FAILED", "Failed to stop recording", e)
        }
    }
}
