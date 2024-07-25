package com.wazeemkhan.cctvguard.recorder

import android.media.MediaRecorder
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.IOException
import java.util.UUID

class RecorderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var recorder: MediaRecorder? = null
    private var outputPath: String? = null
    private var tempFilePath: String? = null

    override fun getName(): String {
        return "RecorderModule"
    }

    @ReactMethod
    fun startRecording() {
        outputPath = "${reactApplicationContext.getExternalFilesDir(null)?.absolutePath}/${UUID.randomUUID()}.mp4"
        tempFilePath = "${reactApplicationContext.getExternalFilesDir(null)?.absolutePath}/${UUID.randomUUID()}.tmp.mp4"
        recorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setVideoSource(MediaRecorder.VideoSource.SURFACE)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setVideoEncoder(MediaRecorder.VideoEncoder.H264)
            setOutputFile(tempFilePath)
            try {
                prepare()
                start()
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }

        // Start a thread to handle chunked uploading
        Thread {
            while (recorder != null) {
                try {
                    Thread.sleep(10000) // Upload every 10 seconds
                    saveChunk()
                } catch (e: InterruptedException) {
                    e.printStackTrace()
                }
            }
        }.start()
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            recorder?.apply {
                stop()
                release()
            }
            recorder = null
            promise.resolve(outputPath)
        } catch (e: Exception) {
            promise.reject("Recording Error", e)
        }
    }

    private fun saveChunk() {
        val file = File(tempFilePath)
        if (file.exists() && file.length() > 0) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("chunkAvailable", tempFilePath)
            // Reset the file
            file.delete()
            file.createNewFile()
        }
    }
}