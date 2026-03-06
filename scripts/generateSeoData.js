import fs from 'fs';

// ═══════════════════════════════════════════════════════════════════
// FORMAT DICTIONARIES - each format has unique technical facts
// ═══════════════════════════════════════════════════════════════════

const IMAGE_FORMATS = {
    jpg: {
        name: 'JPG', fullName: 'Joint Photographic Experts Group', isLossy: true, year: 1992,
        facts: [
            'Created in 1992, JPG is the most widely used image compression standard in the world, supported by every device ever made.',
            'JPG achieves 10:1 compression with little perceptible loss in quality using a DCT-based algorithm.',
            'Every digital camera, smartphone, and scanner defaults to JPG output - it is responsible for over 70% of all images on the internet.'
        ]
    },
    jpeg: {
        name: 'JPEG', fullName: 'Joint Photographic Experts Group', isLossy: true, year: 1992,
        facts: [
            'JPEG and JPG are the exact same format - the 3-letter extension was a limitation of early Windows file systems.',
            'The JPEG standard was published by the International Organization for Standardization (ISO) in 1992.',
            'Every time you re-save a JPEG, it re-compresses and loses quality - a phenomenon called "generation loss."'
        ]
    },
    png: {
        name: 'PNG', fullName: 'Portable Network Graphics', isLossy: false, year: 1996,
        facts: [
            'PNG was invented in 1995 as a free, open-source alternative to GIF after the LZW patent controversy.',
            'PNG is mathematically lossless - every single pixel is preserved perfectly with zero degradation.',
            'PNG supports full alpha transparency with 256 levels of opacity, making it essential for web graphics and UI design.'
        ]
    },
    webp: {
        name: 'WebP', fullName: 'Web Picture format', isLossy: true, year: 2010,
        facts: [
            'Developed by Google in 2010, WebP was specifically designed to make the web faster by reducing image payload.',
            'WebP files are typically 25–34% smaller than equivalent JPEGs and 26% smaller than PNGs at the same quality.',
            'WebP supports both lossy and lossless compression, animation, and alpha transparency - an all-in-one format.'
        ]
    },
    gif: {
        name: 'GIF', fullName: 'Graphics Interchange Format', isLossy: true, year: 1987,
        facts: [
            'GIF was created by CompuServe in 1987, predating the World Wide Web by four years.',
            'True GIF images are limited to a palette of only 256 colors, which is why photographic GIFs look grainy.',
            'Over 10 billion GIFs are served daily across messaging platforms like WhatsApp, iMessage, and Slack.'
        ]
    },
    heic: {
        name: 'HEIC', fullName: 'High Efficiency Image Container', isLossy: true, year: 2017,
        facts: [
            'Apple adopted HEIC in iOS 11 (2017) - every modern iPhone photo is a HEIC file by default.',
            'HEIC files are roughly 50% smaller than JPEGs of the same quality, saving billions of gigabytes of global storage.',
            'A single HEIC file can contain an image sequence, which is how Apple\'s Live Photos and burst mode work behind the scenes.'
        ]
    },
    heif: {
        name: 'HEIF', fullName: 'High Efficiency Image Format', isLossy: true, year: 2015,
        facts: [
            'HEIF is the underlying ISO standard (ISO/IEC 23008-12) that Apple\'s HEIC format is built upon.',
            'HEIF uses the HEVC (H.265) video codec to compress still images, which is why it achieves such remarkable compression.',
            'Beyond photos, HEIF can store depth maps, audio, and image sequences in a single file.'
        ]
    },
    bmp: {
        name: 'BMP', fullName: 'Bitmap Image File', isLossy: false, year: 1985,
        facts: [
            'BMP was introduced with Windows 1.0 in 1985, making it one of the oldest image formats still in existence.',
            'Because BMP stores raw, uncompressed pixel data, a 12-megapixel image can be over 36 MB.',
            'BMP remains essential in embedded systems and microcontroller projects where decompression libraries are unavailable.'
        ]
    },
    tiff: {
        name: 'TIFF', fullName: 'Tagged Image File Format', isLossy: false, year: 1986,
        facts: [
            'TIFF has been the gold standard for the professional printing and publishing industry since the 1980s.',
            'The Library of Congress and national archives worldwide use TIFF for digitizing and preserving historical documents.',
            'TIFF supports CMYK color spaces, multiple layers, and up to 32-bit depth - essential for professional photography.'
        ]
    },
    avif: {
        name: 'AVIF', fullName: 'AV1 Image File Format', isLossy: true, year: 2019,
        facts: [
            'AVIF is based on the AV1 video codec, developed by the Alliance for Open Media (Netflix, Google, Apple, Amazon, Meta).',
            'In head-to-head tests, AVIF images are ~50% smaller than JPEGs and ~20% smaller than WebP at the same visual quality.',
            'AVIF supports HDR, wide color gamut, and film grain synthesis - features no other web image format offers.'
        ]
    },
    psd: {
        name: 'PSD', fullName: 'Adobe Photoshop Document', isLossy: false, year: 1990,
        facts: [
            'PSD is Adobe Photoshop\'s native format, storing every layer, mask, adjustment, and blend mode in a single file.',
            'Despite being proprietary, PSD has become the universal exchange format for graphic design handoffs.',
            'A single PSD file can exceed 2 GB when working with high-resolution multi-layer compositions.'
        ]
    },
    tga: {
        name: 'TGA', fullName: 'Truevision Graphics Adapter', isLossy: false, year: 1984,
        facts: [
            'TGA was developed in 1984 by Truevision Inc. and became the standard texture format in early PC gaming.',
            'Many classic video game engines (Quake, Half-Life, Unreal) used TGA files extensively for character and environment textures.',
            'TGA supports run-length encoding (RLE) compression for modest file size reduction without quality loss.'
        ]
    },
    eps: {
        name: 'EPS', fullName: 'Encapsulated PostScript', isLossy: false, year: 1987,
        facts: [
            'EPS was the standard for vector artwork exchange in professional publishing before PDF became ubiquitous.',
            'EPS files contain PostScript code - the same page-description language used by professional laser printers.',
            'Adobe originally developed EPS in 1987 as part of its PostScript Level 2 specification.'
        ]
    },
    jxl: {
        name: 'JXL', fullName: 'JPEG XL', isLossy: false, year: 2021,
        facts: [
            'JPEG XL is a modern, royalty-free format designed as the true successor to the original JPEG standard.',
            'JPEG XL can losslessly recompress existing JPEG files to ~20% smaller sizes while being perfectly reversible.',
            'It supports features like progressive decoding, animation, HDR, and up to 32-bit float precision per channel.'
        ]
    },
};

const VIDEO_FORMATS = {
    mp4: {
        name: 'MP4', fullName: 'MPEG-4 Part 14', year: 2003,
        facts: [
            'MP4 is universally supported across smartphones, smart TVs, game consoles, and all web browsers.',
            'MP4 is actually a "container" format that typically wraps H.264 video and AAC audio streams together.',
            'Over 80% of all video content consumed on the internet is delivered in the MP4 format.'
        ]
    },
    webm: {
        name: 'WebM', fullName: 'Web Media Video', year: 2010,
        facts: [
            'WebM is Google\'s open-source, royalty-free video format built specifically for the web.',
            'YouTube serves the majority of its 4K videos using WebM containers with the VP9 codec inside.',
            'Unlike MP4 (which uses patented H.264), WebM can be used by anyone without licensing fees.'
        ]
    },
    mov: {
        name: 'MOV', fullName: 'QuickTime Movie', year: 1991,
        facts: [
            'MOV was developed by Apple in 1991 as part of the QuickTime multimedia framework.',
            'Every video recorded on an iPhone or iPad is saved natively as a .mov file.',
            'MOV and MP4 are technically very similar "container" formats - converting between them is often just repackaging.'
        ]
    },
    avi: {
        name: 'AVI', fullName: 'Audio Video Interleave', year: 1992,
        facts: [
            'Introduced by Microsoft in November 1992, AVI is one of the oldest video formats still in use today.',
            'AVI files are typically much larger than modern MP4s because the format predates efficient compression codecs.',
            'Despite its age, AVI remains popular for storing raw, uncompressed video captures from professional equipment.'
        ]
    },
    mkv: {
        name: 'MKV', fullName: 'Matroska Video', year: 2002,
        facts: [
            'MKV is named after Russian Matryoshka (nesting) dolls because it can contain unlimited audio, video, and subtitle tracks.',
            'MKV is the de facto standard for high-quality movie rips and anime fan-sub distributions.',
            'A single MKV file can hold multiple audio languages and subtitle tracks, making it ideal for international content.'
        ]
    },
    flv: {
        name: 'FLV', fullName: 'Flash Video', year: 2002,
        facts: [
            'FLV powered the early era of web video streaming, including the original launch of YouTube in 2005.',
            'The format became obsolete when Adobe ended support for Flash Player on December 31, 2020.',
            'At its peak, Flash Video accounted for over 75% of all online video content.'
        ]
    },
    wmv: {
        name: 'WMV', fullName: 'Windows Media Video', year: 1999,
        facts: [
            'WMV was developed by Microsoft in 1999 as part of the Windows Media framework.',
            'It was widely used for streaming video in the early 2000s before MP4 became dominant.',
            'WMV uses Microsoft\'s proprietary VC-1 codec, which was actually adopted as a Blu-ray disc standard.'
        ]
    },
};

const CURRENCY_DATA = {
    usd: {
        name: 'USD', fullName: 'United States Dollar', symbol: '$', country: 'United States',
        facts: [
            'The US Dollar is the world\'s primary reserve currency, held by central banks in over 60% of global foreign exchange reserves.',
            'The dollar symbol "$" may have originated from the Spanish peso, which was marked with a "P" and an "S" that merged over time.',
            'Over $2 trillion USD circulates in physical banknotes worldwide, with roughly 80% of $100 bills held outside the US.'
        ]
    },
    eur: {
        name: 'EUR', fullName: 'Euro', symbol: '€', country: 'Eurozone (20 countries)',
        facts: [
            'The Euro was officially introduced on January 1, 1999, and is now used by over 340 million people across 20 EU countries.',
            'Euro banknotes feature fictional bridges and arches representing European architectural styles - no real buildings are depicted to avoid national bias.',
            'The Euro is the second most traded currency in the world after the US Dollar.'
        ]
    },
    gbp: {
        name: 'GBP', fullName: 'British Pound Sterling', symbol: '£', country: 'United Kingdom',
        facts: [
            'The British Pound Sterling is the oldest currency still in continuous use, dating back over 1,200 years to Anglo-Saxon England.',
            'The "pound" originally referred to the weight of a pound of sterling silver - literally a pound of silver.',
            'GBP is the fourth most traded currency in global forex markets.'
        ]
    },
    jpy: {
        name: 'JPY', fullName: 'Japanese Yen', symbol: '¥', country: 'Japan',
        facts: [
            'The Japanese Yen has no subdivision (no "cents") - 1 yen is the smallest denomination in daily circulation.',
            'Japan\'s yen was introduced in 1871 during the Meiji government\'s effort to modernize the economy.',
            'The yen is the third most traded currency globally and is a popular "safe haven" currency during economic uncertainty.'
        ]
    },
    inr: {
        name: 'INR', fullName: 'Indian Rupee', symbol: '₹', country: 'India',
        facts: [
            'The Indian Rupee symbol ₹ was designed by D. Udaya Kumar and officially adopted in 2010.',
            'The word "rupee" comes from the Sanskrit word "rūpya" meaning wrought silver or a coin of silver.',
            'India demonetized ₹500 and ₹1,000 banknotes overnight in November 2016 in one of the largest monetary experiments in history.'
        ]
    },
    cad: {
        name: 'CAD', fullName: 'Canadian Dollar', symbol: 'C$', country: 'Canada',
        facts: [
            'Canadian dollar coins are nicknamed "loonies" because they feature the common loon (a waterfowl) on the reverse side.',
            'Canada was one of the first countries to introduce polymer (plastic) banknotes, which last 2.5x longer than paper.',
            'The Canadian Dollar is the sixth most traded currency in global forex markets.'
        ]
    },
    aud: {
        name: 'AUD', fullName: 'Australian Dollar', symbol: 'A$', country: 'Australia',
        facts: [
            'Australia pioneered polymer banknotes in 1988 and now all Australian banknotes are made of thin, transparent plastic.',
            'The Australian Dollar is the fifth most traded currency globally despite Australia ranking as only the 13th largest economy.',
            'Australian banknotes feature a transparent window with holographic elements - making them among the hardest to counterfeit.'
        ]
    },
    chf: {
        name: 'CHF', fullName: 'Swiss Franc', symbol: 'Fr', country: 'Switzerland',
        facts: [
            'The Swiss Franc is considered one of the world\'s safest currencies due to Switzerland\'s political neutrality and strong banking sector.',
            '"CHF" stands for "Confoederatio Helvetica Franc" - Confoederatio Helvetica is Switzerland\'s Latin name.',
            'Swiss banknotes are printed vertically (portrait orientation) and feature abstract art rather than political figures.'
        ]
    },
    cny: {
        name: 'CNY', fullName: 'Chinese Yuan Renminbi', symbol: '¥', country: 'China',
        facts: [
            'The Chinese Yuan shares the "¥" symbol with the Japanese Yen but they are completely different currencies.',
            '"Renminbi" means "people\'s currency" in Mandarin and was introduced in 1949 by the People\'s Republic of China.',
            'China has been a global pioneer in central bank digital currencies (CBDC) with its digital yuan (e-CNY) pilot.'
        ]
    },
    mxn: {
        name: 'MXN', fullName: 'Mexican Peso', symbol: '$', country: 'Mexico',
        facts: [
            'The Mexican Peso was the first currency to use the "$" sign - the US Dollar adopted it later.',
            'Mexico\'s 50 peso note has been voted one of the most beautiful banknotes in the world.',
            'The Peso is one of the 15 most traded currencies globally and the most traded in Latin America.'
        ]
    },
    brl: {
        name: 'BRL', fullName: 'Brazilian Real', symbol: 'R$', country: 'Brazil',
        facts: [
            'The Brazilian Real was introduced in 1994 as part of the Plano Real economic stabilization program.',
            'Brazil has had eight different currencies since 1942, with the Real being the most stable and long-lasting.',
            'Brazilian banknotes feature native animals - the jaguar, monkey, parrot, and sea turtle.'
        ]
    },
    krw: {
        name: 'KRW', fullName: 'South Korean Won', symbol: '₩', country: 'South Korea',
        facts: [
            'South Korea has some of the highest-denomination banknotes in regular use - the 50,000 won bill is worth about $38 USD.',
            'The word "won" is a cognate of the Chinese "yuan" and Japanese "yen" - all three derive from the same Chinese character (圓).',
            'South Korea is one of the world\'s most cashless societies, with over 90% of transactions done digitally.'
        ]
    },
    btc: {
        name: 'BTC', fullName: 'Bitcoin', symbol: '₿', country: 'Decentralized',
        facts: [
            'Bitcoin was created in 2009 by the pseudonymous Satoshi Nakamoto, whose true identity remains unknown.',
            'Only 21 million bitcoins will ever exist - this hard cap is enforced by the protocol\'s code.',
            'The first real-world Bitcoin transaction was 10,000 BTC for two Papa John\'s pizzas in May 2010, now worth billions.'
        ]
    },
    eth: {
        name: 'ETH', fullName: 'Ethereum', symbol: 'Ξ', country: 'Decentralized',
        facts: [
            'Ethereum was proposed by Vitalik Buterin in 2013 when he was just 19 years old.',
            'Ethereum transitioned from Proof of Work to Proof of Stake in September 2022, reducing energy consumption by ~99.95%.',
            'Ethereum\'s "smart contracts" power the majority of NFTs, DeFi protocols, and decentralized apps worldwide.'
        ]
    },
    sgd: {
        name: 'SGD', fullName: 'Singapore Dollar', symbol: 'S$', country: 'Singapore',
        facts: [
            'Singapore issues a $10,000 note - one of the highest-denomination banknotes in the world.',
            'The Singapore Dollar is nicknamed the "Sing dollar" in forex markets.',
            'Singapore manages its monetary policy primarily through exchange rate adjustments rather than interest rates.'
        ]
    },
    nzd: {
        name: 'NZD', fullName: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand',
        facts: [
            'The New Zealand Dollar is nicknamed the "Kiwi" after the country\'s national bird.',
            'New Zealand was an early adopter of polymer (plastic) banknotes, switching fully in 1999.',
            'The NZD is one of the 10 most traded currencies globally due to New Zealand\'s agricultural exports.'
        ]
    },
    zar: {
        name: 'ZAR', fullName: 'South African Rand', symbol: 'R', country: 'South Africa',
        facts: [
            'The Rand is named after the Witwatersrand ridge, where most of South Africa\'s gold deposits were found.',
            'Post-2012, all South African banknotes feature Nelson Mandela on the front - previously they depicted wildlife.',
            'South Africa\'s Krugerrand gold coin was the world\'s first modern bullion coin, launched in 1967.'
        ]
    },
    try_: {
        name: 'TRY', fullName: 'Turkish Lira', symbol: '₺', country: 'Turkey',
        facts: [
            'Turkey redenominated its currency in 2005, removing six zeros - 1,000,000 old Lira became 1 new Lira.',
            'The Turkish Lira symbol ₺ was designed to look like an anchor, representing stability.',
            'The Lira has experienced significant volatility, losing over 80% of its value against the USD between 2018 and 2023.'
        ]
    },
};

const UNIT_DATA = {
    // Length
    km: {
        name: 'Kilometers', abbr: 'km', category: 'length', facts: [
            'One kilometer is exactly 1,000 meters, defined by the International System of Units (SI) since 1960.',
            'The average person walks about 5 km per hour at a comfortable pace.'
        ]
    },
    mi: {
        name: 'Miles', abbr: 'mi', category: 'length', facts: [
            'The mile traces back to the Roman "mille passus" - 1,000 double paces of a Roman legionary.',
            'Only three countries officially use miles: the United States, the United Kingdom, and Myanmar.'
        ]
    },
    m: {
        name: 'Meters', abbr: 'm', category: 'length', facts: [
            'The meter was originally defined in 1793 as one ten-millionth of the distance from the equator to the North Pole.',
            'Since 1983, the meter is defined by the speed of light - the distance light travels in 1/299,792,458 of a second.'
        ]
    },
    ft: {
        name: 'Feet', abbr: 'ft', category: 'length', facts: [
            'The foot was originally based on the length of a human foot and varied by region for centuries.',
            'Aviation worldwide uses feet for altitude measurement, even in metric countries - it\'s an international standard.'
        ]
    },
    cm: {
        name: 'Centimeters', abbr: 'cm', category: 'length', facts: [
            'One centimeter is 1/100th of a meter - the prefix "centi" comes from the Latin word for "hundred."',
            'Screen sizes and body measurements in most of the world are expressed in centimeters.'
        ]
    },
    in_: {
        name: 'Inches', abbr: 'in', category: 'length', facts: [
            'The inch was historically defined as the width of a man\'s thumb or three barleycorns laid end to end.',
            'Screen sizes for TVs, monitors, and phones are universally measured diagonally in inches, even in metric countries.'
        ]
    },
    yd: {
        name: 'Yards', abbr: 'yd', category: 'length', facts: [
            'The yard was supposedly defined by King Henry I of England as the distance from his nose to his outstretched thumb.',
            'American football fields are measured in yards - the playing field is exactly 100 yards long.'
        ]
    },
    mm: {
        name: 'Millimeters', abbr: 'mm', category: 'length', facts: [
            'Millimeters are the standard unit for engineering precision - most manufactured parts are specified to 0.01mm tolerances.',
            'Rainfall is measured in millimeters worldwide (except in the US, which uses inches).'
        ]
    },
    // Mass
    kg: {
        name: 'Kilograms', abbr: 'kg', category: 'mass', facts: [
            'Until 2019, the kilogram was defined by a physical platinum-iridium cylinder stored in a vault in Paris.',
            'The kilogram is now defined by fixing the value of the Planck constant - making it based on quantum physics.'
        ]
    },
    lb: {
        name: 'Pounds', abbr: 'lb', category: 'mass', facts: [
            'The abbreviation "lb" comes from the Latin "libra pondo" meaning "a pound by weight."',
            'In the US and UK, body weight is almost always discussed in pounds rather than kilograms.'
        ]
    },
    g: {
        name: 'Grams', abbr: 'g', category: 'mass', facts: [
            'One gram was originally defined as the mass of one cubic centimeter of water at 4°C.',
            'Precious metals, gems, and nutritional values are commonly expressed in grams worldwide.'
        ]
    },
    oz: {
        name: 'Ounces', abbr: 'oz', category: 'mass', facts: [
            'The abbreviation "oz" comes from the Italian word "onza" for ounce.',
            'A US fluid ounce of water weighs approximately one avoirdupois ounce - but they are different measurement systems.'
        ]
    },
    // Temperature
    C: {
        name: 'Celsius', abbr: '°C', category: 'temperature', facts: [
            'The Celsius scale was originally defined backwards - Anders Celsius set 0° as boiling and 100° as freezing in 1742.',
            'Celsius and Fahrenheit intersect at exactly -40 degrees - the only temperature that reads the same on both scales.'
        ]
    },
    F: {
        name: 'Fahrenheit', abbr: '°F', category: 'temperature', facts: [
            'Daniel Fahrenheit calibrated 0°F as the temperature of an ice/salt brine mixture and 96°F as body temperature.',
            'Only the US, Bahamas, Cayman Islands, Liberia, and Palau use Fahrenheit as their primary temperature scale.'
        ]
    },
    K: {
        name: 'Kelvin', abbr: 'K', category: 'temperature', facts: [
            'Kelvin starts at absolute zero (-273.15°C) - the coldest possible temperature where all molecular motion ceases.',
            'Scientists and engineers worldwide use Kelvin because it eliminates the concept of "negative" temperatures.'
        ]
    },
    // Volume
    l: {
        name: 'Liters', abbr: 'L', category: 'volume', facts: [
            'One liter is defined as exactly 1,000 cubic centimeters (1 dm³).',
            'Fuel efficiency in most of the world is measured in liters per 100 km, not miles per gallon.'
        ]
    },
    gal: {
        name: 'Gallons', abbr: 'gal', category: 'volume', facts: [
            'A US gallon (3.785 L) is different from an Imperial gallon (4.546 L) - they are not interchangeable.',
            'The US gallon is based on the old English wine gallon, while the Imperial gallon is based on volume of water at a specific temperature.'
        ]
    },
    ml: {
        name: 'Milliliters', abbr: 'mL', category: 'volume', facts: [
            'One milliliter equals exactly one cubic centimeter - making it the standard for medical dosing worldwide.',
            'A standard teaspoon holds about 5 mL, and a tablespoon holds about 15 mL.'
        ]
    },
    // Data
    MB: {
        name: 'Megabytes', abbr: 'MB', category: 'data', facts: [
            'A megabyte is 1,000,000 bytes (decimal) or 1,048,576 bytes (binary/MiB) depending on the standard used.',
            'A typical high-quality photo from a modern smartphone is between 3–8 MB.'
        ]
    },
    GB: {
        name: 'Gigabytes', abbr: 'GB', category: 'data', facts: [
            'One gigabyte can hold approximately 250 MP3 songs or 300 high-resolution photographs.',
            'The average smartphone user consumes about 15 GB of mobile data per month globally.'
        ]
    },
    TB: {
        name: 'Terabytes', abbr: 'TB', category: 'data', facts: [
            'One terabyte can store approximately 500 hours of HD video or 6.5 million document pages.',
            'The entire printed collection of the US Library of Congress is estimated to be about 10 TB if digitized.'
        ]
    },
    KB: {
        name: 'Kilobytes', abbr: 'KB', category: 'data', facts: [
            'A kilobyte is 1,000 bytes - roughly enough to store a short paragraph of plain text.',
            'The entire original source code for the Apollo 11 guidance computer was only about 72 KB.'
        ]
    },
};

// ═══════════════════════════════════════════════════════════════════
// GENERATION LOGIC
// ═══════════════════════════════════════════════════════════════════

const SEED_DATA = [];

// ------------ IMAGE PAIRS (skip self and skip duplicated manual entries) ------------
function generateImagePairs() {
    const formats = Object.keys(IMAGE_FORMATS);
    for (const src of formats) {
        for (const tgt of formats) {
            if (src === tgt) continue;

            const s = IMAGE_FORMATS[src];
            const t = IMAGE_FORMATS[tgt];

            // Generate a unique intro based on lossy/lossless properties
            let qualityNote;
            if (!s.isLossy && t.isLossy) {
                qualityNote = `When converting from lossless ${s.name} to the compressed ${t.name} format, file sizes shrink dramatically while maintaining excellent visual quality.`;
            } else if (s.isLossy && !t.isLossy) {
                qualityNote = `Converting ${s.name} to the lossless ${t.name} format ensures every pixel is preserved perfectly - ideal for editing, archiving, and professional workflows.`;
            } else if (s.isLossy && t.isLossy) {
                qualityNote = `Both ${s.name} and ${t.name} use lossy compression, so the conversion focuses on compatibility and optimal file size rather than lossless fidelity.`;
            } else {
                qualityNote = `Both ${s.name} and ${t.name} are lossless formats, ensuring a pixel-perfect conversion with zero quality degradation.`;
            }

            SEED_DATA.push({
                slug: `${src}-to-${tgt}`,
                title: `Convert ${s.name} to ${t.name} Free Online - Instant, Private`,
                description: `Convert ${s.name} to ${t.name} free in your browser. No upload, no quality loss, no limits. Fast, private ${s.name} to ${t.name} converter.`,
                h1: `Convert ${s.name} to ${t.name} - Free & Instant`,
                intro: `Need to convert ${s.name} (${s.fullName}) files to ${t.name} (${t.fullName})? Our free online converter runs entirely in your browser - your files never leave your device. ${qualityNote}`,
                sourceFormat: s.name,
                targetFormat: t.name,
                converterType: 'image',
                converterMode: tgt === 'jpg' || tgt === 'jpeg' ? 'jpeg' : tgt,
                keywords: [`${src} to ${tgt}`, `convert ${src} to ${tgt}`, `${src} to ${tgt} converter`, `${src} to ${tgt} online free`, `${s.name.toLowerCase()} to ${t.name.toLowerCase()}`],
                faqItems: [
                    { question: `How do I convert ${s.name} to ${t.name}?`, answer: `Drag and drop your ${s.name} file into the converter above, or click to browse. The conversion to ${t.name} happens instantly in your browser - no upload required.` },
                    { question: `Is ${s.name} to ${t.name} conversion safe and private?`, answer: `Yes, 100% private. Your ${s.name} files are never uploaded to a remote server. All processing happens locally on your device using WebAssembly technology.` },
                    { question: `What is the difference between ${s.name} and ${t.name}?`, answer: `${s.name} (${s.fullName}, ${s.year}) is ${s.isLossy ? 'a lossy' : 'a lossless'} format. ${t.name} (${t.fullName}, ${t.year}) is ${t.isLossy ? 'a lossy' : 'a lossless'} format. ${qualityNote}` },
                ],
                funFacts: [
                    { title: `About ${s.name}`, content: s.facts[0] },
                    { title: `About ${t.name}`, content: t.facts[0] },
                    { title: `${s.name} vs ${t.name}`, content: s.facts[2] || s.facts[1] },
                ],
                relatedConversions: [],
            });
        }
    }
}

// ------------ VIDEO PAIRS (source → mp4/webm/gif/mp3) ------------
function generateVideoPairs() {
    const sources = Object.keys(VIDEO_FORMATS);
    const targets = ['mp4', 'webm', 'gif'];

    for (const src of sources) {
        for (const tgt of targets) {
            if (src === tgt) continue;

            const s = VIDEO_FORMATS[src];
            const tName = tgt === 'webm' ? 'WebM' : tgt.toUpperCase();
            const tDesc = tgt === 'gif' ? 'animated GIF' : tName;

            SEED_DATA.push({
                slug: `${src}-to-${tgt}`,
                title: `Convert ${s.name} to ${tName} Free - Fast Video Converter`,
                description: `Convert ${s.name} to ${tDesc} free online. Browser-based conversion, no file upload. High quality ${s.name} to ${tName} converter.`,
                h1: `Convert ${s.name} to ${tName} - Free & High Quality`,
                intro: `Convert your ${s.name} (${s.fullName}) videos to ${tDesc} format instantly in your browser. No server upload required - your videos stay completely private on your device. Perfect for social media, messaging, and web use.`,
                sourceFormat: s.name,
                targetFormat: tName,
                converterType: 'video',
                converterMode: tgt,
                keywords: [`${src} to ${tgt}`, `convert ${src} to ${tgt}`, `${src} to ${tgt} converter`, `${src} to ${tgt} free online`],
                faqItems: [
                    { question: `How do I convert ${s.name} to ${tName}?`, answer: `Simply drag and drop your ${s.name} file onto the converter, select the ${tName} output mode, and click convert. The ${tName} file will be ready for download in seconds.` },
                    { question: `Will my ${s.name} video quality be preserved?`, answer: `Our converter uses optimized FFmpeg settings to maintain the best possible quality during the ${s.name} to ${tName} conversion. You can adjust the quality slider to balance file size and visual fidelity.` },
                ],
                funFacts: [
                    { title: `About ${s.name}`, content: s.facts[0] },
                    { title: `About ${tName}`, content: tgt === 'gif' ? 'GIF was created by CompuServe in 1987 - older than the World Wide Web itself.' : (VIDEO_FORMATS[tgt] ? VIDEO_FORMATS[tgt].facts[0] : s.facts[1]) },
                    { title: 'Privacy First', content: 'Unlike most video converters that upload your files to remote servers, our tool processes everything locally in your browser using WebAssembly - your videos never leave your device.' },
                ],
                relatedConversions: [],
            });
        }

        // Video to audio (MP3/M4A)
        const s = VIDEO_FORMATS[src];
        SEED_DATA.push({
            slug: `${src}-to-mp3`,
            title: `Convert ${s.name} to MP3 Free - Extract Audio Instantly`,
            description: `Extract audio from ${s.name} videos to MP3 free. Fast, private, no upload. Browser-based ${s.name} to MP3 audio extractor.`,
            h1: `Extract Audio from ${s.name} - Free MP3 Converter`,
            intro: `Extract the audio track from any ${s.name} (${s.fullName}) video and save it as a high-quality audio file. Perfect for saving music, podcasts, lectures, or interview audio from video files. Everything runs locally in your browser.`,
            sourceFormat: s.name,
            targetFormat: 'MP3',
            converterType: 'video',
            converterMode: 'mp3',
            keywords: [`${src} to mp3`, `extract audio from ${src}`, `${src} to audio`, `${src} to mp3 free`, `convert ${src} to mp3`],
            faqItems: [
                { question: `How do I extract audio from a ${s.name} file?`, answer: `Drop your ${s.name} file onto the converter, select "Extract Audio" mode, and click convert. The audio track will be extracted and available for download in seconds.` },
                { question: 'What audio quality will I get?', answer: 'Audio is extracted at up to 256kbps AAC quality (.m4a format), which is CD-quality audio. You can adjust the quality slider to balance file size and clarity.' },
            ],
            funFacts: [
                { title: `About ${s.name}`, content: s.facts[0] },
                { title: 'Audio Extraction', content: 'Most video files store audio and video as completely separate streams inside a "container." Extracting audio is like pulling one file out of a ZIP archive - fast and lossless.' },
            ],
            relatedConversions: [],
        });
    }
}

// ------------ CURRENCY PAIRS (top 18 currencies × top 18) ----------
function generateCurrencyPairs() {
    const topCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'inr', 'cad', 'aud', 'chf', 'cny', 'mxn', 'brl', 'krw', 'btc', 'eth', 'sgd', 'nzd', 'zar', 'try_'];

    for (const src of topCurrencies) {
        for (const tgt of topCurrencies) {
            if (src === tgt) continue;

            const s = CURRENCY_DATA[src];
            const t = CURRENCY_DATA[tgt];
            if (!s || !t) continue;

            const srcSlug = src === 'try_' ? 'try' : src;
            const tgtSlug = tgt === 'try_' ? 'try' : tgt;

            SEED_DATA.push({
                slug: `${srcSlug}-to-${tgtSlug}`,
                title: `Convert ${s.name} to ${t.name} - Live Exchange Rate | Free`,
                description: `Convert ${s.name} to ${t.name} with live exchange rates. Free real-time ${s.fullName} to ${t.fullName} converter with 30-day trend chart.`,
                h1: `Convert ${s.name} to ${t.name} - Live Exchange Rate`,
                intro: `Convert ${s.fullName} (${s.name}) to ${t.fullName} (${t.name}) instantly using real-time exchange rates. Our free currency converter fetches live mid-market rates and shows historical trends. No sign-up, no ads, completely free.`,
                sourceFormat: s.name,
                targetFormat: t.name,
                converterType: 'currency',
                converterMode: `${srcSlug}_to_${tgtSlug}`,
                keywords: [
                    `${srcSlug} to ${tgtSlug}`, `${s.name} to ${t.name}`, `convert ${s.name.toLowerCase()} to ${t.name.toLowerCase()}`,
                    `${s.fullName.toLowerCase()} to ${t.fullName.toLowerCase()}`, `${srcSlug} to ${tgtSlug} exchange rate`,
                    `1 ${s.name} to ${t.name}`, `${s.name} ${t.name} converter`
                ],
                faqItems: [
                    { question: `What is the current ${s.name} to ${t.name} exchange rate?`, answer: `Our converter displays the live mid-market exchange rate for ${s.name} to ${t.name}, updated in real time. The rate fluctuates throughout the day based on global forex market conditions.` },
                    { question: `How do I convert ${s.fullName} to ${t.fullName}?`, answer: `Simply enter the amount in ${s.name} you want to convert, and the equivalent in ${t.name} will be calculated automatically using the latest exchange rate.` },
                    { question: `Is this ${s.name} to ${t.name} converter free?`, answer: `Yes, 100% free with no limits. Convert as many times as you want. We display the mid-market rate with no hidden markups or fees.` },
                ],
                funFacts: [
                    { title: `About the ${s.fullName}`, content: s.facts[0] },
                    { title: `About the ${t.fullName}`, content: t.facts[0] },
                    { title: 'Did You Know?', content: s.facts[2] || s.facts[1] },
                ],
                relatedConversions: [],
            });
        }
    }
}

// ------------ UNIT PAIRS (within same category only) ----------
function generateUnitPairs() {
    const units = Object.keys(UNIT_DATA);

    for (const src of units) {
        for (const tgt of units) {
            if (src === tgt) continue;
            const s = UNIT_DATA[src];
            const t = UNIT_DATA[tgt];
            if (s.category !== t.category) continue; // Only same-category conversions

            const srcSlug = src === 'in_' ? 'inches' : (src === 'C' ? 'celsius' : (src === 'F' ? 'fahrenheit' : (src === 'K' ? 'kelvin' : src)));
            const tgtSlug = tgt === 'in_' ? 'inches' : (tgt === 'C' ? 'celsius' : (tgt === 'F' ? 'fahrenheit' : (tgt === 'K' ? 'kelvin' : tgt)));

            SEED_DATA.push({
                slug: `${srcSlug}-to-${tgtSlug}`,
                title: `Convert ${s.name} to ${t.name} - Free ${s.category.charAt(0).toUpperCase() + s.category.slice(1)} Converter`,
                description: `Convert ${s.name} (${s.abbr}) to ${t.name} (${t.abbr}) instantly. Free, accurate ${s.category} converter. Works offline.`,
                h1: `Convert ${s.name} to ${t.name} - Instant & Accurate`,
                intro: `Instantly convert ${s.name} (${s.abbr}) to ${t.name} (${t.abbr}) with our free online ${s.category} converter. The calculation runs entirely in your browser using precision-engineered formulas - no internet connection required after the page loads.`,
                sourceFormat: `${s.name} (${s.abbr})`,
                targetFormat: `${t.name} (${t.abbr})`,
                converterType: 'unit',
                converterMode: `${srcSlug}_to_${tgtSlug}`,
                keywords: [
                    `${s.name.toLowerCase()} to ${t.name.toLowerCase()}`, `${s.abbr} to ${t.abbr}`,
                    `convert ${s.name.toLowerCase()} to ${t.name.toLowerCase()}`,
                    `${s.name.toLowerCase()} to ${t.name.toLowerCase()} converter`,
                    `how many ${t.name.toLowerCase()} in a ${s.name.toLowerCase().replace(/s$/, '')}`,
                ],
                faqItems: [
                    { question: `How do I convert ${s.name} to ${t.name}?`, answer: `Enter the value in ${s.name} (${s.abbr}) in the input field above, and the equivalent in ${t.name} (${t.abbr}) will be calculated instantly. The formula runs locally in your browser.` },
                    { question: `Is this ${s.name} to ${t.name} converter accurate?`, answer: `Yes, our converter uses mathematically precise conversion factors based on international standards (SI units). Results are accurate to 7 significant figures.` },
                ],
                funFacts: [
                    { title: `About ${s.name}`, content: s.facts[0] },
                    { title: `About ${t.name}`, content: t.facts[0] },
                ],
                relatedConversions: [],
            });
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// RUN ALL GENERATORS
// ═══════════════════════════════════════════════════════════════════
generateImagePairs();
generateVideoPairs();
generateCurrencyPairs();
generateUnitPairs();

// Populate related conversions: pick 4 related by same source/target
SEED_DATA.forEach(entry => {
    const related = SEED_DATA
        .filter(x => (x.sourceFormat === entry.sourceFormat || x.targetFormat === entry.targetFormat) && x.slug !== entry.slug)
        .map(x => x.slug)
        .slice(0, 4);
    entry.relatedConversions = related;
});

const outPath = './src/lib/generatedSeoData.json';
fs.writeFileSync(outPath, JSON.stringify(SEED_DATA, null, 2));

console.log(`✅ Generated ${SEED_DATA.length} SEO pages:`);
console.log(`   • Image conversions: ${SEED_DATA.filter(e => e.converterType === 'image').length}`);
console.log(`   • Video conversions: ${SEED_DATA.filter(e => e.converterType === 'video').length}`);
console.log(`   • Currency conversions: ${SEED_DATA.filter(e => e.converterType === 'currency').length}`);
console.log(`   • Unit conversions: ${SEED_DATA.filter(e => e.converterType === 'unit').length}`);
console.log(`   Output: ${outPath}`);

// ═══════════════════════════════════════════════════════════════════
// GENERATE SITEMAP
// ═══════════════════════════════════════════════════════════════════

const SITEMAP_PATH = './public/sitemap.xml';
const BASE_URL = 'https://convertfiles.app';

let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Add base static routes first
const staticRoutes = ['', '/image-converter', '/units', '/data-converter', '/currency-converter'];
for (const route of staticRoutes) {
    sitemapContent += `  <url>\n    <loc>${BASE_URL}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
}

// Add the 600+ generated pages
SEED_DATA.forEach(entry => {
    sitemapContent += `  <url>\n    <loc>${BASE_URL}/convert/${entry.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
});

sitemapContent += `</urlset>`;

fs.writeFileSync(SITEMAP_PATH, sitemapContent);
console.log(`✅ Generated sitemap at ${SITEMAP_PATH} with ${staticRoutes.length + SEED_DATA.length} URLs`);
