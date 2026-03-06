export type ConversionMode = 'gif' | 'compress' | 'webm' | 'mp3' | 'mp4'

export interface ConversionProfile {
    id: ConversionMode
    label: string
    description: string
    outputExtension: string
    mimeType: string
    acceptedInputs: string[]
    buildArgs: (options: ConversionOptions) => string[]
}

export interface ConversionOptions {
    quality: number   // 0-100 (maps to CRF)
    gifFps: number    // GIF only
    gifWidth: number  // GIF only
}

export const PROFILES: Record<ConversionMode, ConversionProfile> = {
    gif: {
        id: 'gif',
        label: 'Animated GIF',
        description: 'Perfect for Discord, Twitter & Slack',
        outputExtension: 'gif',
        mimeType: 'image/gif',
        acceptedInputs: ['video/*'],
        buildArgs: ({ gifFps, gifWidth }) => {
            // Fast single-pass generic palette - skips the extremely slow two-pass palettegen
            // Crucial for performance on single-thread processing
            const scale = `${gifWidth}:-1:flags=fast_bilinear`
            return ['-vf', `fps=${gifFps},scale=${scale}`, '-loop', '0']
        },
    },
    compress: {
        id: 'compress',
        label: 'Compress MP4',
        description: 'Shrink for Discord, WhatsApp & email',
        outputExtension: 'mp4',
        mimeType: 'video/mp4',
        acceptedInputs: ['video/*'],
        buildArgs: ({ quality }) => {
            // Aggressive compression: highest quality is 720p (q=4), lowest is 360p (q=12)
            const q = Math.round(12 - (quality / 100) * 8)
            const scale = quality > 50 ? '-2:720' : '-2:360'
            return [
                '-c:v', 'mpeg4', '-q:v', String(q),
                '-vf', `scale=${scale}`,
                '-c:a', 'aac', '-b:a', '64k',
                '-movflags', '+faststart',
            ]
        },
    },
    webm: {
        id: 'webm',
        label: 'Convert to WebM',
        description: 'Smaller size, ideal for web playback',
        outputExtension: 'webm',
        mimeType: 'video/webm',
        acceptedInputs: ['video/*'],
        buildArgs: () => {
            // Using libvpx (VP8) instead of libvpx-vp9 to heavily reduce memory footprint and avoid OOM
            // Max quality (crf=10) without scale reduction
            return [
                '-c:v', 'libvpx', '-crf', '10', '-b:v', '1M',
                '-deadline', 'realtime', '-cpu-used', '8', '-threads', '4',
                '-c:a', 'libvorbis',
            ]
        },
    },
    mp3: {
        id: 'mp3',
        label: 'Extract Audio',
        description: 'Pull the audio track from any video',
        outputExtension: 'm4a',
        mimeType: 'audio/mp4',
        acceptedInputs: ['video/*', 'audio/*'],
        buildArgs: () => {
            // Extraction uses universally supported AAC (.m4a) at max quality (256k)
            return ['-vn', '-c:a', 'aac', '-b:a', '256k']
        },
    },
    mp4: {
        id: 'mp4',
        label: 'Convert to MP4',
        description: 'Universal format, plays everywhere',
        outputExtension: 'mp4',
        mimeType: 'video/mp4',
        acceptedInputs: ['video/*'],
        buildArgs: () => {
            // Constant high quality (q:v = 2) without scale reduction
            return [
                '-c:v', 'mpeg4', '-q:v', '2',
                '-c:a', 'aac',
                '-movflags', '+faststart',
            ]
        },
    },
}
