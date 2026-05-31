package com.cardbazar

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.net.URL

class NotificationImageModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "NotificationImageModule"

    /**
     * Downloads [imageUrl], composites it (contain-scaled, horizontally centered) onto a
     * #44004F landscape canvas, saves it to the app cache, and resolves with the file:// path.
     * Rejects on any error so the caller can fall back to the original URL.
     */
    @ReactMethod
    fun prepareNotificationImage(imageUrl: String, promise: Promise) {
        Thread {
            try {
                val canvasW = 1024
                val canvasH = 512

                // Delete stale composited images from previous notifications
                reactApplicationContext.cacheDir
                    .listFiles { f -> f.name.startsWith("notif_img_") }
                    ?.forEach { it.delete() }

                // Download source bitmap
                val src: Bitmap = URL(imageUrl).openStream().use { BitmapFactory.decodeStream(it) }

                // Create the purple canvas
                val result = Bitmap.createBitmap(canvasW, canvasH, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(result)
                canvas.drawColor(Color.parseColor("#44004F"))

                // Contain-scale: keep aspect ratio, fit inside canvas
                val scale = minOf(canvasW.toFloat() / src.width, canvasH.toFloat() / src.height)
                val scaledW = src.width * scale
                val scaledH = src.height * scale
                val left = (canvasW - scaledW) / 2f
                val top = (canvasH - scaledH) / 2f

                val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
                canvas.drawBitmap(src, null, RectF(left, top, left + scaledW, top + scaledH), paint)
                src.recycle()

                // Persist to cache
                val file = File(reactApplicationContext.cacheDir, "notif_img_${System.currentTimeMillis()}.jpg")
                FileOutputStream(file).use { out -> result.compress(Bitmap.CompressFormat.JPEG, 92, out) }
                result.recycle()

                promise.resolve("file://${file.absolutePath}")
            } catch (e: Exception) {
                promise.reject("NOTIF_IMAGE_ERROR", e.message, e)
            }
        }.start()
    }
}
