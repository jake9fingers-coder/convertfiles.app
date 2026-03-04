/**
 * Master SEO Data Registry
 * 
 * Every conversion pair the app supports gets its own entry here.
 * Each entry powers a unique landing page with keyword-optimized meta tags,
 * structured data, and on-page content.
 * 
 * KEY SEO INSIGHT: "jpg" is searched 13.6x more than "jpeg" (246K vs 18.1K).
 * All user-facing content uses "JPG" as the primary term.
 */

export interface FAQItem {
    question: string
    answer: string
}

export interface ConversionSEOData {
    /** URL slug, e.g. "heic-to-jpg" → /convert/heic-to-jpg */
    slug: string
    /** Meta title (max ~60 chars for Google) */
    title: string
    /** Meta description (150-160 chars, keyword-rich) */
    description: string
    /** H1 heading on the landing page */
    h1: string
    /** Intro paragraph below the H1 */
    intro: string
    /** Source format display name */
    sourceFormat: string
    /** Target format display name */
    targetFormat: string
    /** Which converter to use: 'video' | 'image' | 'data' */
    converterType: 'video' | 'image' | 'data'
    /** The converter mode to pre-select */
    converterMode: string
    /** FAQ items for the page */
    faqItems: FAQItem[]
    /** Slugs of related conversion pages */
    relatedConversions: string[]
    /** Extra keywords for meta keywords tag */
    keywords: string[]
}

export const SITE_URL = 'https://convertfiles.app'
export const SITE_NAME = 'convertfiles.app'

export const SEO_CONVERSIONS: ConversionSEOData[] = [
    // ============================================================
    // 🔴 HIGHEST PRIORITY — HEIC conversions (246K+ monthly searches)
    // ============================================================
    {
        slug: 'heic-to-jpg',
        title: 'Convert HEIC to JPG Free Online — Instant, Full Quality',
        description: 'Convert HEIC to JPG instantly with zero quality loss. Free, private, no upload needed. Works on iPhone photos — drag, drop, download your JPG files.',
        h1: 'Convert HEIC to JPG — Free, Instant & Full Quality',
        intro: 'Convert your iPhone HEIC photos to universally compatible JPG format instantly. Our free HEIC to JPG converter runs entirely in your browser — your files never leave your device. No sign-up, no upload delays, no file size limits. Just drag and drop your .heic files and download perfect JPG images in seconds.',
        sourceFormat: 'HEIC',
        targetFormat: 'JPG',
        converterType: 'image',
        converterMode: 'jpeg',
        faqItems: [
            { question: 'What is a HEIC file?', answer: 'HEIC (High Efficiency Image Container) is the default photo format on iPhones and iPads since iOS 11. It produces smaller files than JPG while maintaining the same quality, but many Windows programs, websites, and apps don\'t support it natively.' },
            { question: 'Does converting HEIC to JPG lose quality?', answer: 'Our converter preserves maximum quality during the HEIC to JPG conversion. The output JPG is saved at the highest quality setting to maintain the original image fidelity.' },
            { question: 'Is it safe to convert HEIC files here?', answer: 'Absolutely. Your files are converted entirely in your browser using local processing. They are never uploaded to any server, making this the most private way to convert HEIC to JPG.' },
            { question: 'Can I batch convert multiple HEIC files to JPG?', answer: 'Yes! You can drag and drop multiple HEIC files at once. Each file is converted individually and you can download them all when done.' },
        ],
        relatedConversions: ['heic-to-png', 'jpg-to-png', 'webp-to-jpg', 'png-to-jpg'],
        keywords: ['heic to jpg', 'heic to jpeg', 'convert heic to jpg', 'heic converter', 'heic to jpg converter', 'iphone photo to jpg', 'heic jpg converter free', 'convert heic to jpeg', 'heic file to jpg', 'heic to jpg online', '.heic to .jpg'],
    },
    {
        slug: 'heic-to-jpeg',
        title: 'Convert HEIC to JPEG Free — Instant High Quality Converter',
        description: 'Free HEIC to JPEG converter online. Convert iPhone HEIC photos to JPEG format instantly in your browser. No upload, no quality loss, 100% private.',
        h1: 'Convert HEIC to JPEG — Free & Private',
        intro: 'Need to convert HEIC files to JPEG? Our free online converter transforms your iPhone photos from HEIC to JPEG format instantly. Everything runs in your browser — no server upload, no waiting, no limits. JPEG (also known as JPG) is the most universally supported image format.',
        sourceFormat: 'HEIC',
        targetFormat: 'JPEG',
        converterType: 'image',
        converterMode: 'jpeg',
        faqItems: [
            { question: 'What is the difference between JPG and JPEG?', answer: 'JPG and JPEG are exactly the same format. The only difference is the file extension — older Windows systems used the 3-letter ".jpg" extension, while ".jpeg" is the full name. Our converter outputs .jpg files which are universally compatible.' },
            { question: 'Why do iPhones save photos as HEIC instead of JPEG?', answer: 'Apple adopted HEIC because it produces files roughly half the size of JPEG while maintaining the same visual quality. This saves storage space on your device, but HEIC isn\'t universally supported outside the Apple ecosystem.' },
            { question: 'Can I convert HEIC to JPEG without losing quality?', answer: 'Yes! Our converter uses the highest quality setting when converting HEIC to JPEG, preserving maximum image fidelity. The conversion happens locally in your browser for instant results.' },
        ],
        relatedConversions: ['heic-to-jpg', 'heic-to-png', 'jpg-to-png', 'png-to-jpg'],
        keywords: ['heic to jpeg', 'convert heic to jpeg', 'heic jpeg converter', 'heic to jpeg online free', '.heic to .jpeg'],
    },
    {
        slug: 'heic-to-png',
        title: 'Convert HEIC to PNG Free — Lossless Quality, Instant',
        description: 'Convert HEIC to PNG free online. Lossless quality with transparent background support. No upload needed — runs in your browser. Try now!',
        h1: 'Convert HEIC to PNG — Lossless & Free',
        intro: 'Convert your HEIC photos to PNG format for lossless quality and transparent background support. PNG is perfect when you need pixel-perfect accuracy or transparency. Our converter runs entirely in your browser — your photos stay private on your device.',
        sourceFormat: 'HEIC',
        targetFormat: 'PNG',
        converterType: 'image',
        converterMode: 'png',
        faqItems: [
            { question: 'Should I convert HEIC to PNG or JPG?', answer: 'Choose PNG if you need lossless quality or transparent backgrounds (great for logos, screenshots, graphics). Choose JPG for regular photos where smaller file size matters more. Both conversions are free and instant here.' },
            { question: 'Is HEIC to PNG conversion lossless?', answer: 'Yes! PNG is a lossless format, so converting HEIC to PNG preserves all the original image data without any compression artifacts.' },
            { question: 'Can I convert multiple HEIC files to PNG at once?', answer: 'Absolutely. Drag and drop as many HEIC files as you need — each one will be converted to PNG individually.' },
        ],
        relatedConversions: ['heic-to-jpg', 'png-to-jpg', 'webp-to-png', 'jpg-to-png'],
        keywords: ['heic to png', 'convert heic to png', 'heic png converter', 'heic to png online', 'heic to png free', 'iphone heic to png'],
    },

    // ============================================================
    // 🔴 HIGHEST PRIORITY — WebP conversions (165K+ monthly searches)
    // ============================================================
    {
        slug: 'webp-to-png',
        title: 'Convert WebP to PNG Free Online — Instant, High Quality',
        description: 'Convert WebP to PNG free online. Lossless conversion, preserve transparency. No upload — runs in your browser instantly. No limits.',
        h1: 'Convert WebP to PNG — Free, Instant & Lossless',
        intro: 'Convert WebP images to PNG format instantly and for free. PNG preserves full quality with lossless compression and supports transparent backgrounds. Our WebP to PNG converter runs entirely in your browser — nothing is uploaded anywhere.',
        sourceFormat: 'WebP',
        targetFormat: 'PNG',
        converterType: 'image',
        converterMode: 'png',
        faqItems: [
            { question: 'Why convert WebP to PNG?', answer: 'While WebP is great for web performance, PNG is more universally supported by image editors, print services, and older software. PNG also preserves transparency and is completely lossless.' },
            { question: 'Does WebP to PNG conversion lose quality?', answer: 'No! PNG is a lossless format, so converting from WebP to PNG preserves all image data. If the original WebP was lossy, the PNG will be a perfect copy of the decoded image.' },
            { question: 'Is this WebP to PNG converter free?', answer: 'Yes, 100% free with no limits. Convert as many WebP images to PNG as you want. No sign-up, no watermarks, no restrictions.' },
        ],
        relatedConversions: ['webp-to-jpg', 'png-to-jpg', 'heic-to-png', 'png-to-webp'],
        keywords: ['webp to png', 'convert webp to png', 'webp to png converter', 'webp to png online', 'webp to png free', '.webp to .png'],
    },
    {
        slug: 'webp-to-jpg',
        title: 'Convert WebP to JPG Free — Instant Online Converter',
        description: 'Convert WebP to JPG free online in seconds. High quality, no upload, no limits. Works in your browser — your files stay private.',
        h1: 'Convert WebP to JPG — Free & Instant',
        intro: 'Easily convert WebP images to JPG format directly in your browser. JPG is the most widely supported image format across all devices and platforms. Our free WebP to JPG converter processes everything locally — your images never leave your device.',
        sourceFormat: 'WebP',
        targetFormat: 'JPG',
        converterType: 'image',
        converterMode: 'jpeg',
        faqItems: [
            { question: 'Why would I convert WebP to JPG?', answer: 'JPG (JPEG) is universally supported by every device, software, and platform. Some older programs, email clients, and social media platforms may not accept WebP files, making JPG the safest choice for compatibility.' },
            { question: 'Is the quality maintained when converting WebP to JPG?', answer: 'Our converter uses the highest quality setting for JPG output, minimizing any quality loss during conversion. The results are visually identical to the original.' },
            { question: 'How many WebP files can I convert at once?', answer: 'There\'s no limit! Drop as many WebP files as you want and they\'ll all be converted to JPG. Everything processes on your device.' },
        ],
        relatedConversions: ['webp-to-png', 'jpg-to-webp', 'heic-to-jpg', 'png-to-jpg'],
        keywords: ['webp to jpg', 'webp to jpeg', 'convert webp to jpg', 'webp to jpg converter', 'webp to jpg online', 'webp to jpg free'],
    },

    // ============================================================
    // 🔴 HIGHEST PRIORITY — Video conversions (110K-201K searches)
    // ============================================================
    {
        slug: 'mp4-to-mp3',
        title: 'Convert MP4 to MP3 Free — Extract Audio Instantly',
        description: 'Extract audio from MP4 videos to MP3 format free. Fast, private, no upload. Works offline in your browser. No limits or sign-up.',
        h1: 'Convert MP4 to MP3 — Extract Audio Free',
        intro: 'Extract the audio track from any MP4 video and save it as a high-quality audio file. Perfect for saving music, podcasts, lectures, or any audio content from video files. Everything runs locally in your browser — no upload required.',
        sourceFormat: 'MP4',
        targetFormat: 'MP3',
        converterType: 'video',
        converterMode: 'mp3',
        faqItems: [
            { question: 'How do I extract audio from an MP4 video?', answer: 'Simply drag and drop your MP4 file onto our converter, select "Extract Audio" mode, and click convert. The audio track will be extracted and available for download in seconds.' },
            { question: 'What audio quality will I get?', answer: 'Our converter extracts audio at up to 256kbps AAC quality, which is CD-quality audio. You can adjust the quality slider to balance file size and audio fidelity.' },
            { question: 'Is the MP4 to MP3 conversion free?', answer: 'Yes, 100% free with no limits on file size or number of conversions. No sign-up required.' },
        ],
        relatedConversions: ['mp4-to-gif', 'mov-to-mp4', 'mp4-to-webm', 'video-to-mp3'],
        keywords: ['mp4 to mp3', 'mp4 to mp3 converter', 'extract audio from video', 'video to audio', 'mp4 to mp3 free', 'mp4 to mp3 online'],
    },
    {
        slug: 'mp4-to-gif',
        title: 'Convert MP4 to GIF Free — Create Animated GIFs Instantly',
        description: 'Turn any MP4 video into an animated GIF for free. Custom FPS and size. No upload, runs in your browser. Perfect for Discord & social media.',
        h1: 'Convert MP4 to GIF — Free Animated GIF Creator',
        intro: 'Create animated GIFs from any MP4 video instantly. Perfect for Discord, Twitter, Slack, Reddit, and social media posts. Customize frame rate and dimensions to get the perfect GIF. No upload needed — everything processes on your device.',
        sourceFormat: 'MP4',
        targetFormat: 'GIF',
        converterType: 'video',
        converterMode: 'gif',
        faqItems: [
            { question: 'How do I make a GIF from an MP4 video?', answer: 'Drag and drop your MP4 file, choose "Animated GIF" mode, adjust the FPS and width to your liking, and hit convert. Your GIF will be ready in seconds.' },
            { question: 'Can I customize the GIF size and quality?', answer: 'Yes! You can adjust the frame rate (FPS) and output width. Higher FPS gives smoother animation, while smaller width reduces file size — perfect for staying under Discord\'s 10MB limit.' },
            { question: 'What\'s the maximum video length for GIF conversion?', answer: 'There\'s no hard limit, but shorter clips (5-30 seconds) produce the best GIFs. Longer videos will create very large GIF files.' },
        ],
        relatedConversions: ['mp4-to-mp3', 'mov-to-mp4', 'mp4-to-webm', 'video-to-gif'],
        keywords: ['mp4 to gif', 'mp4 to gif converter', 'video to gif', 'make gif from video', 'mp4 to gif free', 'mp4 to gif online', 'create gif'],
    },
    {
        slug: 'mov-to-mp4',
        title: 'Convert MOV to MP4 Free — Quick, High Quality',
        description: 'Convert MOV to MP4 free online. Fast, high quality, no upload needed. Convert iPhone videos and QuickTime files to MP4 instantly.',
        h1: 'Convert MOV to MP4 — Free & High Quality',
        intro: 'Convert Apple MOV files to universally compatible MP4 format. MOV is the default format for iPhone videos and QuickTime recordings, but MP4 plays everywhere. Our free converter runs in your browser with no uploads required.',
        sourceFormat: 'MOV',
        targetFormat: 'MP4',
        converterType: 'video',
        converterMode: 'mp4',
        faqItems: [
            { question: 'Why convert MOV to MP4?', answer: 'MP4 is the most universally supported video format. While MOV works great on Apple devices, MP4 plays on virtually every device, player, and platform — including Windows, Android, smart TVs, and all social media.' },
            { question: 'Does MOV to MP4 conversion affect video quality?', answer: 'Our converter maintains high quality during the conversion. At 100% quality setting, the output is virtually indistinguishable from the original MOV file.' },
            { question: 'Can I convert large MOV files?', answer: 'Yes! Since everything processes in your browser, there are no server-imposed file size limits. Convert movies, screen recordings, and any size MOV file.' },
        ],
        relatedConversions: ['mp4-to-gif', 'mp4-to-mp3', 'mp4-to-webm', 'video-to-mp3'],
        keywords: ['mov to mp4', 'convert mov to mp4', 'mov to mp4 converter', 'mov to mp4 free', 'mov to mp4 online', 'quicktime to mp4', 'iphone video to mp4'],
    },
    {
        slug: 'mp4-to-webm',
        title: 'Convert MP4 to WebM Free — Optimized for Web',
        description: 'Convert MP4 to WebM free online. Smaller file size, perfect for web playback. No upload — instant browser-based conversion.',
        h1: 'Convert MP4 to WebM — Free & Web-Optimized',
        intro: 'Convert your MP4 videos to WebM format for optimal web playback. WebM offers excellent compression and is supported by all modern browsers. Ideal for embedding videos on websites, blogs, and web applications.',
        sourceFormat: 'MP4',
        targetFormat: 'WebM',
        converterType: 'video',
        converterMode: 'webm',
        faqItems: [
            { question: 'What is WebM format?', answer: 'WebM is an open media format designed specifically for the web. It uses VP8/VP9 video codecs and produces smaller files than MP4 while maintaining good quality — perfect for website videos.' },
            { question: 'Is WebM better than MP4 for websites?', answer: 'For web delivery, WebM often produces smaller files with comparable quality. However, MP4 has broader device support. Many web developers offer both formats for maximum compatibility.' },
            { question: 'Does this converter work offline?', answer: 'Yes! Once the page loads, the converter works entirely offline. Your videos are processed locally on your device without any internet connection needed.' },
        ],
        relatedConversions: ['mp4-to-gif', 'mp4-to-mp3', 'mov-to-mp4', 'webm-to-mp4'],
        keywords: ['mp4 to webm', 'convert mp4 to webm', 'mp4 to webm converter', 'mp4 to webm free', 'mp4 to webm online'],
    },
    {
        slug: 'video-to-mp3',
        title: 'Video to MP3 Converter — Extract Audio Free Online',
        description: 'Extract audio from any video to MP3 format free. Supports MP4, MOV, MKV, WebM and more. No upload, instant browser conversion.',
        h1: 'Video to MP3 — Extract Audio from Any Video',
        intro: 'Extract audio from any video format — MP4, MOV, MKV, WebM, AVI and more. Get high-quality audio files instantly. Everything processes in your browser so your videos remain completely private.',
        sourceFormat: 'Video',
        targetFormat: 'MP3',
        converterType: 'video',
        converterMode: 'mp3',
        faqItems: [
            { question: 'What video formats are supported?', answer: 'Our converter supports virtually all video formats including MP4, MOV, MKV, WebM, AVI, FLV, WMV, and many more. Simply drop any video file and extract the audio.' },
            { question: 'What audio format will I get?', answer: 'Audio is extracted as high-quality AAC (.m4a) format, which is compatible with all modern devices and offers excellent audio quality.' },
            { question: 'Can I extract audio from a YouTube video?', answer: 'Our tool converts local video files only. You\'ll need to first download the video file, then use our converter to extract the audio from it.' },
        ],
        relatedConversions: ['mp4-to-mp3', 'mp4-to-gif', 'mov-to-mp4', 'video-to-gif'],
        keywords: ['video to mp3', 'extract audio from video', 'video to audio converter', 'video to mp3 free', 'video to mp3 online'],
    },
    {
        slug: 'video-to-gif',
        title: 'Video to GIF Converter — Free, No Upload',
        description: 'Convert any video to animated GIF free. Custom size & FPS. No upload — private browser conversion. Perfect for memes & social sharing.',
        h1: 'Video to GIF — Create GIFs from Any Video',
        intro: 'Turn any video into a shareable animated GIF. Supports MP4, MOV, MKV, WebM, and more. Customize the frame rate and dimensions for perfect Discord, Twitter, and Reddit GIFs. Your videos never leave your device.',
        sourceFormat: 'Video',
        targetFormat: 'GIF',
        converterType: 'video',
        converterMode: 'gif',
        faqItems: [
            { question: 'What is the best frame rate for GIFs?', answer: 'For most GIFs, 10-15 FPS provides a good balance between smooth animation and small file size. Use higher FPS (20-30) for action-heavy clips.' },
            { question: 'How do I keep GIFs under Discord\'s file limit?', answer: 'Reduce the width to 320-480 pixels and keep the FPS at 10-12. Shorter clips (3-10 seconds) also help keep the file size manageable.' },
        ],
        relatedConversions: ['mp4-to-gif', 'mp4-to-mp3', 'mov-to-mp4', 'video-to-mp3'],
        keywords: ['video to gif', 'video to gif converter', 'make gif from video', 'video to gif free', 'video to gif online', 'create gif from video'],
    },

    // ============================================================
    // 🟡 HIGH PRIORITY — Common image conversions
    // ============================================================
    {
        slug: 'png-to-jpg',
        title: 'Convert PNG to JPG Free — Instant, High Quality',
        description: 'Convert PNG to JPG free online. Reduce file size while keeping quality. No upload needed — instant browser conversion. No limits.',
        h1: 'Convert PNG to JPG — Free & Instant',
        intro: 'Convert PNG images to JPG format to reduce file size while maintaining excellent visual quality. JPG is ideal for photos, web images, and anywhere smaller files are needed. Our converter runs in your browser — fast, free, and private.',
        sourceFormat: 'PNG',
        targetFormat: 'JPG',
        converterType: 'image',
        converterMode: 'jpeg',
        faqItems: [
            { question: 'Why convert PNG to JPG?', answer: 'JPG files are typically 5-10x smaller than PNG files for photographs. If you don\'t need transparency, JPG is the better choice for sharing, uploading, and web use.' },
            { question: 'Does PNG to JPG conversion remove transparency?', answer: 'Yes, JPG doesn\'t support transparent backgrounds. Transparent areas in your PNG will be converted to white. If you need to keep transparency, stay with PNG or use WebP.' },
            { question: 'What quality level is used?', answer: 'Our converter uses maximum quality (100%) by default, producing JPGs that are visually indistinguishable from the original PNG while being significantly smaller.' },
        ],
        relatedConversions: ['jpg-to-png', 'png-to-webp', 'heic-to-jpg', 'webp-to-jpg'],
        keywords: ['png to jpg', 'png to jpeg', 'convert png to jpg', 'png to jpg converter', 'png to jpg free', 'png to jpg online'],
    },
    {
        slug: 'jpg-to-png',
        title: 'Convert JPG to PNG Free — Lossless Quality Online',
        description: 'Convert JPG to PNG free online. Get lossless quality and transparent background support. No upload — instant browser-based conversion.',
        h1: 'Convert JPG to PNG — Free & Lossless',
        intro: 'Convert JPG images to PNG format for lossless quality preservation. PNG supports transparent backgrounds, making it perfect for logos, graphics, and design work. Free, fast, and completely private — everything runs in your browser.',
        sourceFormat: 'JPG',
        targetFormat: 'PNG',
        converterType: 'image',
        converterMode: 'png',
        faqItems: [
            { question: 'Why convert JPG to PNG?', answer: 'PNG is lossless, meaning no quality is lost during saving. It also supports transparency, which is essential for logos, overlays, and design elements. Converting to PNG is ideal when you need pixel-perfect quality.' },
            { question: 'Will the file size increase when converting to PNG?', answer: 'Yes, PNG files are typically larger than JPGs because PNG uses lossless compression. The tradeoff is perfect quality with no compression artifacts.' },
            { question: 'Can I add transparency after converting to PNG?', answer: 'Converting JPG to PNG doesn\'t automatically add transparency, but the resulting PNG file will support transparency if you later edit it in an image editor.' },
        ],
        relatedConversions: ['png-to-jpg', 'jpg-to-webp', 'heic-to-png', 'webp-to-png'],
        keywords: ['jpg to png', 'jpeg to png', 'convert jpg to png', 'jpg to png converter', 'jpg to png free', 'jpg to png online'],
    },
    {
        slug: 'png-to-webp',
        title: 'Convert PNG to WebP Free — Smaller Files, Same Quality',
        description: 'Convert PNG to WebP free online. Up to 30% smaller files with same quality. Instant browser conversion. No upload, no limits.',
        h1: 'Convert PNG to WebP — Smaller Files, Same Quality',
        intro: 'Convert PNG images to modern WebP format for significantly smaller file sizes without visible quality loss. WebP is the next-gen format supported by all modern browsers. Perfect for optimizing website images.',
        sourceFormat: 'PNG',
        targetFormat: 'WebP',
        converterType: 'image',
        converterMode: 'webp',
        faqItems: [
            { question: 'How much smaller are WebP files compared to PNG?', answer: 'WebP files are typically 26-34% smaller than PNG files for lossless compression, and even smaller with lossy compression — all while maintaining comparable visual quality.' },
            { question: 'Does WebP support transparency?', answer: 'Yes! WebP supports both lossy and lossless transparency (alpha channel), making it a great alternative to PNG for web graphics.' },
        ],
        relatedConversions: ['webp-to-png', 'png-to-jpg', 'jpg-to-webp', 'webp-to-jpg'],
        keywords: ['png to webp', 'convert png to webp', 'png to webp converter', 'png to webp free', 'png to webp online'],
    },
    {
        slug: 'jpg-to-webp',
        title: 'Convert JPG to WebP Free — Optimize Images for Web',
        description: 'Convert JPG to WebP free online. Smaller files, faster websites. No upload — instant browser conversion. Modern web format.',
        h1: 'Convert JPG to WebP — Optimize for the Web',
        intro: 'Convert JPG images to WebP for modern web optimization. WebP delivers noticeably smaller files than JPG with nearly identical visual quality. Essential for web developers, bloggers, and anyone looking to speed up their website.',
        sourceFormat: 'JPG',
        targetFormat: 'WebP',
        converterType: 'image',
        converterMode: 'webp',
        faqItems: [
            { question: 'Is WebP better than JPG?', answer: 'For web use, yes. WebP produces 25-35% smaller files than JPG at equivalent visual quality. All modern browsers support WebP, making it the recommended format for web images.' },
            { question: 'Can all browsers display WebP images?', answer: 'All modern browsers (Chrome, Firefox, Safari, Edge) support WebP. Only very old browser versions may not support it.' },
        ],
        relatedConversions: ['webp-to-jpg', 'jpg-to-png', 'png-to-webp', 'heic-to-jpg'],
        keywords: ['jpg to webp', 'jpeg to webp', 'convert jpg to webp', 'jpg to webp converter', 'jpg to webp free'],
    },

    // ============================================================
    // 🟡 HIGH PRIORITY — More video conversions
    // ============================================================
    {
        slug: 'webm-to-mp4',
        title: 'Convert WebM to MP4 Free — Universal Playback',
        description: 'Convert WebM to MP4 free online. Plays everywhere — phones, TVs, social media. No upload needed, instant browser conversion.',
        h1: 'Convert WebM to MP4 — Plays Everywhere',
        intro: 'Convert WebM videos to universally compatible MP4 format. While WebM is great for web browsers, MP4 plays everywhere — smartphones, smart TVs, social media, and every video player. Free, fast, and private.',
        sourceFormat: 'WebM',
        targetFormat: 'MP4',
        converterType: 'video',
        converterMode: 'mp4',
        faqItems: [
            { question: 'Why convert WebM to MP4?', answer: 'MP4 has universal device and platform support. If you need to share a video on social media, WhatsApp, or play it on a TV, MP4 is the safest format choice.' },
            { question: 'Is this conversion free?', answer: 'Yes, completely free with no file size limits, no watermarks, and no sign-up required.' },
        ],
        relatedConversions: ['mp4-to-webm', 'mov-to-mp4', 'mp4-to-gif', 'mp4-to-mp3'],
        keywords: ['webm to mp4', 'convert webm to mp4', 'webm to mp4 converter', 'webm to mp4 free', 'webm to mp4 online'],
    },
    {
        slug: 'compress-mp4',
        title: 'Compress MP4 Video Free — Reduce File Size Online',
        description: 'Compress MP4 videos free. Reduce file size for Discord, WhatsApp & email. No upload — fast browser compression. Keeps quality.',
        h1: 'Compress MP4 — Reduce Video File Size Free',
        intro: 'Shrink your MP4 videos to fit Discord, WhatsApp, email attachments, and more. Our compressor reduces file size while keeping great visual quality. Adjust the quality slider to find your perfect balance between size and clarity.',
        sourceFormat: 'MP4',
        targetFormat: 'Compressed MP4',
        converterType: 'video',
        converterMode: 'compress',
        faqItems: [
            { question: 'How much can I compress an MP4?', answer: 'Depending on the source video and quality settings, you can typically achieve 50-80% file size reduction. Lower quality settings produce smaller files.' },
            { question: 'Will compression make my video look bad?', answer: 'At moderate quality settings (50-75%), most videos look great. Very aggressive compression may introduce visible artifacts, but our compressor is optimized for a good balance.' },
        ],
        relatedConversions: ['mp4-to-gif', 'mp4-to-webm', 'mov-to-mp4', 'mp4-to-mp3'],
        keywords: ['compress mp4', 'mp4 compressor', 'compress video', 'reduce video size', 'compress mp4 free', 'video compressor online', 'compress video for discord'],
    },

    // ============================================================
    // 🟢 MEDIUM PRIORITY — Professional/niche image formats
    // ============================================================
    {
        slug: 'jpg-to-bmp',
        title: 'Convert JPG to BMP Free Online — Uncompressed Quality',
        description: 'Convert JPG to BMP free online. Uncompressed bitmap format. No upload — instant conversion in your browser. Lossless output.',
        h1: 'Convert JPG to BMP — Uncompressed Bitmap',
        intro: 'Convert JPG images to BMP (Bitmap) format for uncompressed, lossless image files. BMP is useful for legacy applications, embedded systems, and whenever you need raw, uncompressed image data.',
        sourceFormat: 'JPG',
        targetFormat: 'BMP',
        converterType: 'image',
        converterMode: 'bmp',
        faqItems: [
            { question: 'What is BMP format?', answer: 'BMP (Bitmap) is an uncompressed image format developed by Microsoft. It stores raw pixel data without compression, resulting in large files but zero quality loss.' },
        ],
        relatedConversions: ['jpg-to-png', 'png-to-jpg', 'jpg-to-webp'],
        keywords: ['jpg to bmp', 'convert jpg to bmp', 'jpeg to bmp', 'jpg to bmp converter'],
    },
    {
        slug: 'png-to-bmp',
        title: 'Convert PNG to BMP Free — Raw Bitmap Output',
        description: 'Convert PNG to BMP format free online. Raw, uncompressed bitmap for legacy apps. No upload, instant browser conversion.',
        h1: 'Convert PNG to BMP — Raw Bitmap',
        intro: 'Convert PNG images to BMP format for uncompressed bitmap output. Useful for legacy applications, hardware displays, and systems that require raw pixel data. Free, instant, and private.',
        sourceFormat: 'PNG',
        targetFormat: 'BMP',
        converterType: 'image',
        converterMode: 'bmp',
        faqItems: [
            { question: 'Why convert PNG to BMP?', answer: 'BMP files are used by some legacy applications, embedded systems, and specialized hardware. They contain raw, uncompressed pixel data.' },
        ],
        relatedConversions: ['png-to-jpg', 'png-to-webp', 'jpg-to-bmp'],
        keywords: ['png to bmp', 'convert png to bmp', 'png to bmp converter', 'png to bmp free'],
    },
    {
        slug: 'jpg-to-tiff',
        title: 'Convert JPG to TIFF Free — Professional Print Quality',
        description: 'Convert JPG to TIFF free online. Professional quality for printing & publishing. No upload needed — instant browser conversion.',
        h1: 'Convert JPG to TIFF — Professional Print Format',
        intro: 'Convert JPG images to TIFF format for professional printing, publishing, and archival purposes. TIFF files preserve maximum quality and are the standard for professional photography and print production.',
        sourceFormat: 'JPG',
        targetFormat: 'TIFF',
        converterType: 'image',
        converterMode: 'tiff',
        faqItems: [
            { question: 'What is TIFF format used for?', answer: 'TIFF (Tagged Image File Format) is the industry standard for professional photography, printing, and archival. It supports high bit-depth, multiple layers, and lossless compression.' },
            { question: 'Is TIFF better than JPG for printing?', answer: 'Yes, TIFF is preferred for printing because it\'s lossless. JPG compression can introduce artifacts visible in high-quality prints.' },
        ],
        relatedConversions: ['jpg-to-png', 'png-to-jpg', 'jpg-to-bmp'],
        keywords: ['jpg to tiff', 'convert jpg to tiff', 'jpeg to tiff', 'jpg to tiff converter', 'jpg to tiff free'],
    },
    {
        slug: 'png-to-tiff',
        title: 'Convert PNG to TIFF Free — Professional Quality Output',
        description: 'Convert PNG to TIFF free online. Professional format for print & publishing. Instant conversion, no upload required.',
        h1: 'Convert PNG to TIFF — Print-Ready Quality',
        intro: 'Convert PNG images to TIFF format for professional printing and publishing workflows. TIFF is the industry standard for high-quality, lossless image storage.',
        sourceFormat: 'PNG',
        targetFormat: 'TIFF',
        converterType: 'image',
        converterMode: 'tiff',
        faqItems: [
            { question: 'Should I use TIFF or PNG for printing?', answer: 'TIFF is generally preferred for professional printing because it supports CMYK color spaces, multiple layers, and has broader support in professional design tools.' },
        ],
        relatedConversions: ['png-to-jpg', 'jpg-to-tiff', 'png-to-webp'],
        keywords: ['png to tiff', 'convert png to tiff', 'png to tiff converter', 'png to tiff free'],
    },
    {
        slug: 'jpg-to-avif',
        title: 'Convert JPG to AVIF Free — Next-Gen Format',
        description: 'Convert JPG to AVIF free online. 50% smaller files than JPG with the same quality. Future of web images. Instant conversion.',
        h1: 'Convert JPG to AVIF — Next-Gen Image Format',
        intro: 'Convert JPG images to AVIF, the cutting-edge image format that delivers up to 50% smaller files than JPG with equivalent visual quality. AVIF is the future of web images, backed by Netflix, Google, and other tech giants.',
        sourceFormat: 'JPG',
        targetFormat: 'AVIF',
        converterType: 'image',
        converterMode: 'avif',
        faqItems: [
            { question: 'What is AVIF format?', answer: 'AVIF (AV1 Image File Format) is a modern image format based on the AV1 video codec. It offers significantly better compression than JPG and WebP while maintaining excellent quality.' },
            { question: 'Is AVIF supported by browsers?', answer: 'Chrome, Firefox, and Safari all support AVIF. It\'s rapidly becoming the standard for next-gen web images.' },
        ],
        relatedConversions: ['jpg-to-webp', 'jpg-to-png', 'png-to-webp'],
        keywords: ['jpg to avif', 'convert jpg to avif', 'jpeg to avif', 'jpg to avif converter', 'jpg to avif free'],
    },
    {
        slug: 'png-to-avif',
        title: 'Convert PNG to AVIF Free — Ultra Efficient Format',
        description: 'Convert PNG to AVIF free online. Drastically smaller files with lossless quality option. Modern web format, instant conversion.',
        h1: 'Convert PNG to AVIF — Ultra-Efficient',
        intro: 'Convert PNG images to AVIF for dramatically smaller files. AVIF supports both lossy and lossless compression with transparency, making it useful for all types of web images.',
        sourceFormat: 'PNG',
        targetFormat: 'AVIF',
        converterType: 'image',
        converterMode: 'avif',
        faqItems: [
            { question: 'Is AVIF better than PNG?', answer: 'For web delivery, AVIF files are dramatically smaller than PNG (up to 50-80% reduction) while maintaining visual quality. PNG remains better for situations requiring guaranteed lossless quality.' },
        ],
        relatedConversions: ['png-to-webp', 'png-to-jpg', 'jpg-to-avif'],
        keywords: ['png to avif', 'convert png to avif', 'png to avif converter', 'png to avif free'],
    },

    // ============================================================
    // 🟢 Data conversion pages
    // ============================================================
    {
        slug: 'json-to-csv',
        title: 'Convert JSON to CSV Free — Instant Online Converter',
        description: 'Convert JSON to CSV free online. Transform JSON arrays into spreadsheet-ready CSV files instantly. No upload — browser-based conversion.',
        h1: 'Convert JSON to CSV — Free & Instant',
        intro: 'Convert JSON data to CSV format instantly. Perfect for importing JSON data into Excel, Google Sheets, or any spreadsheet application. Our converter handles nested objects and arrays intelligently.',
        sourceFormat: 'JSON',
        targetFormat: 'CSV',
        converterType: 'data',
        converterMode: 'json_to_csv',
        faqItems: [
            { question: 'How do I convert JSON to CSV?', answer: 'Simply drag and drop your JSON file (or paste JSON text), select CSV as the output format, and click convert. The CSV file will be ready for download in seconds.' },
            { question: 'Does it handle nested JSON?', answer: 'Yes, our converter intelligently flattens nested JSON structures into CSV columns while preserving the data relationships.' },
        ],
        relatedConversions: ['csv-to-json', 'json-to-excel', 'csv-to-excel'],
        keywords: ['json to csv', 'convert json to csv', 'json to csv converter', 'json to csv online', 'json to csv free'],
    },
    {
        slug: 'csv-to-json',
        title: 'Convert CSV to JSON Free — Instant Online Tool',
        description: 'Convert CSV to JSON free online. Transform spreadsheet data into structured JSON instantly. No upload — private browser conversion.',
        h1: 'Convert CSV to JSON — Free & Private',
        intro: 'Transform CSV files into structured JSON data instantly. Perfect for developers, data analysts, and anyone who needs to convert spreadsheet data into JSON format for APIs, databases, or applications.',
        sourceFormat: 'CSV',
        targetFormat: 'JSON',
        converterType: 'data',
        converterMode: 'csv_to_json',
        faqItems: [
            { question: 'What JSON structure will I get?', answer: 'Each CSV row becomes a JSON object, with column headers as keys. The output is a JSON array of objects, ready for use in any application or API.' },
        ],
        relatedConversions: ['json-to-csv', 'csv-to-excel', 'json-to-excel'],
        keywords: ['csv to json', 'convert csv to json', 'csv to json converter', 'csv to json online', 'csv to json free'],
    },
    {
        slug: 'json-to-excel',
        title: 'Convert JSON to Excel Free — Instant XLSX Output',
        description: 'Convert JSON to Excel (XLSX) free. Transform JSON data into formatted spreadsheets. No upload — instant browser conversion.',
        h1: 'Convert JSON to Excel — Free XLSX Converter',
        intro: 'Convert JSON files to Excel (XLSX) spreadsheets instantly. Our converter transforms JSON data into properly formatted Excel workbooks that open in Microsoft Excel, Google Sheets, and LibreOffice.',
        sourceFormat: 'JSON',
        targetFormat: 'Excel (XLSX)',
        converterType: 'data',
        converterMode: 'json_to_xlsx',
        faqItems: [
            { question: 'Will the Excel file be properly formatted?', answer: 'Yes! Column headers are automatically generated from JSON keys, and data types are preserved in the Excel output.' },
        ],
        relatedConversions: ['json-to-csv', 'csv-to-excel', 'excel-to-json'],
        keywords: ['json to excel', 'convert json to xlsx', 'json to xlsx', 'json to excel converter', 'json to excel free'],
    },
    {
        slug: 'csv-to-excel',
        title: 'Convert CSV to Excel Free — Proper XLSX Formatting',
        description: 'Convert CSV to Excel (XLSX) free. Get properly formatted spreadsheets. No upload — instant, private browser conversion.',
        h1: 'Convert CSV to Excel — Formatted Spreadsheets',
        intro: 'Convert CSV files to properly formatted Excel spreadsheets (XLSX). Our converter preserves data types and creates clean, organized workbooks ready for analysis.',
        sourceFormat: 'CSV',
        targetFormat: 'Excel (XLSX)',
        converterType: 'data',
        converterMode: 'csv_to_xlsx',
        faqItems: [
            { question: 'Why not just open CSV in Excel?', answer: 'While Excel can open CSV files, the formatting is often lost — numbers may be treated as text, dates may not be recognized, and special characters can cause issues. Our converter creates a proper XLSX file with correct data types.' },
        ],
        relatedConversions: ['csv-to-json', 'excel-to-csv', 'json-to-excel'],
        keywords: ['csv to excel', 'convert csv to xlsx', 'csv to xlsx', 'csv to excel converter', 'csv to excel free'],
    },
    {
        slug: 'excel-to-csv',
        title: 'Convert Excel to CSV Free — Extract Spreadsheet Data',
        description: 'Convert Excel (XLSX) to CSV free. Extract spreadsheet data as plain text. No upload — instant, private browser conversion.',
        h1: 'Convert Excel to CSV — Extract Data',
        intro: 'Convert Excel spreadsheets to plain CSV text. CSV is universally compatible and perfect for data import, analysis, and sharing across different platforms.',
        sourceFormat: 'Excel (XLSX)',
        targetFormat: 'CSV',
        converterType: 'data',
        converterMode: 'xlsx_to_csv',
        faqItems: [
            { question: 'What happens to Excel formatting?', answer: 'CSV is a plain text format, so Excel formatting (bold, colors, formulas) is lost. Only the raw cell values are kept, which is exactly what most data import tools need.' },
        ],
        relatedConversions: ['excel-to-json', 'csv-to-json', 'csv-to-excel'],
        keywords: ['excel to csv', 'xlsx to csv', 'convert excel to csv', 'excel to csv converter', 'excel to csv free'],
    },
    {
        slug: 'excel-to-json',
        title: 'Convert Excel to JSON Free — Structured Data Output',
        description: 'Convert Excel (XLSX) to JSON free. Transform spreadsheet rows into structured JSON. No upload — instant browser conversion.',
        h1: 'Convert Excel to JSON — Structured Data',
        intro: 'Convert Excel spreadsheets to structured JSON data. Each row becomes a JSON object with column headers as keys — perfect for APIs, databases, and web applications.',
        sourceFormat: 'Excel (XLSX)',
        targetFormat: 'JSON',
        converterType: 'data',
        converterMode: 'xlsx_to_json',
        faqItems: [
            { question: 'How are columns mapped to JSON?', answer: 'The first row of your Excel sheet is used as JSON keys (property names). Each subsequent row becomes a JSON object with those keys.' },
        ],
        relatedConversions: ['excel-to-csv', 'json-to-excel', 'csv-to-json'],
        keywords: ['excel to json', 'xlsx to json', 'convert excel to json', 'excel to json converter', 'excel to json free'],
    },

    // ============================================================
    // Additional image format conversions
    // ============================================================
    {
        slug: 'webp-to-jpeg',
        title: 'Convert WebP to JPEG Free — Universal Compatibility',
        description: 'Convert WebP to JPEG free online. Universal format, instant conversion. No upload — runs in your browser. High quality output.',
        h1: 'Convert WebP to JPEG — Universal Format',
        intro: 'Convert WebP images to JPEG for universal compatibility across all devices and platforms. JPEG (JPG) is the most widely supported image format in the world.',
        sourceFormat: 'WebP',
        targetFormat: 'JPEG',
        converterType: 'image',
        converterMode: 'jpeg',
        faqItems: [
            { question: 'Is JPEG the same as JPG?', answer: 'Yes! JPEG and JPG are the exact same format. The only difference is the file extension length. Our converter outputs .jpg files.' },
        ],
        relatedConversions: ['webp-to-png', 'webp-to-jpg', 'jpg-to-webp'],
        keywords: ['webp to jpeg', 'convert webp to jpeg', 'webp to jpeg converter', 'webp to jpeg free'],
    },
    {
        slug: 'heif-to-jpg',
        title: 'Convert HEIF to JPG Free — Instant Online Converter',
        description: 'Convert HEIF to JPG free online. Same as HEIC conversion — instant, high quality, no upload needed. Compatible with iPhone photos.',
        h1: 'Convert HEIF to JPG — Free & Instant',
        intro: 'Convert HEIF files to JPG format instantly. HEIF and HEIC are the same format — both are used by iPhones and iPads for photos. Our converter handles both seamlessly with maximum quality preservation.',
        sourceFormat: 'HEIF',
        targetFormat: 'JPG',
        converterType: 'image',
        converterMode: 'jpeg',
        faqItems: [
            { question: 'What is the difference between HEIF and HEIC?', answer: 'HEIF is the format name (High Efficiency Image Format) and HEIC is the file extension. They refer to the same thing — Apple photos saved in HEIC are HEIF images.' },
        ],
        relatedConversions: ['heic-to-jpg', 'heic-to-png', 'jpg-to-png'],
        keywords: ['heif to jpg', 'convert heif to jpg', 'heif converter', 'heif to jpeg', 'heif to jpg free'],
    },
]

/** Lookup map by slug for O(1) access */
export const SEO_CONVERSION_MAP: Record<string, ConversionSEOData> = {}
for (const entry of SEO_CONVERSIONS) {
    SEO_CONVERSION_MAP[entry.slug] = entry
}

/** Get the top N conversions by keyword priority for footer/sitemap */
export const TOP_CONVERSIONS = [
    'heic-to-jpg',
    'webp-to-png',
    'mp4-to-gif',
    'webp-to-jpg',
    'mp4-to-mp3',
    'heic-to-png',
    'mov-to-mp4',
    'png-to-jpg',
    'jpg-to-png',
    'video-to-mp3',
    'compress-mp4',
    'json-to-csv',
]
