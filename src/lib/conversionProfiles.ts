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
            // Fast single-pass generic palette — skips the extremely slow two-pass palettegen
            // Crucial for performance on single-thread WASM
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
            const crf = Math.round(18 + (100 - quality) * 0.33)
            return [
                '-c:v', 'libx264', '-crf', String(crf),
                '-preset', 'ultrafast',
                '-c:a', 'aac', '-b:a', '128k',
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
        buildArgs: ({ quality }) => {
            const crf = Math.round(15 + (100 - quality) * 0.48)
            return [
                '-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0',
                '-c:a', 'libopus',
            ]
        },
    },
    mp3: {
        id: 'mp3',
        label: 'Extract Audio',
        description: 'Pull the audio track from any video',
        outputExtension: 'mp3',
        mimeType: 'audio/mpeg',
        acceptedInputs: ['video/*', 'audio/*'],
        buildArgs: ({ quality }) => {
            const vbr = Math.round(9 - quality / 11.1) // 9 (worst) → 0 (best)

            // Note: ffmpeg.wasm often lacks libmp3lame. 
            // We rely on the core's built-in encoder by just specifying the extension, 
            // or falling back to simple quality flags.
            return ['-vn', '-q:a', String(vbr)]
        },
    },
    mp4: {
        id: 'mp4',
        label: 'Convert to MP4',
        description: 'Universal format, plays everywhere',
        outputExtension: 'mp4',
        mimeType: 'video/mp4',
        acceptedInputs: ['video/*'],
        buildArgs: ({ quality }) => {
            const crf = Math.round(18 + (100 - quality) * 0.33)
            return [
                '-c:v', 'libx264', '-crf', String(crf),
                '-preset', 'medium',
                '-c:a', 'aac',
                '-movflags', '+faststart',
            ]
        },
    },
}
