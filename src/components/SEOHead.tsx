import { Helmet } from 'react-helmet-async'
import { SITE_URL, SITE_NAME, type FAQItem } from '../lib/seoConversionData'

interface SEOHeadProps {
    title: string
    description: string
    canonical?: string
    keywords?: string[]
    ogImage?: string
    ogType?: string
    faqItems?: FAQItem[]
    breadcrumbs?: { name: string; url: string }[]
    /** Additional JSON-LD structured data */
    structuredData?: object
}

export default function SEOHead({
    title,
    description,
    canonical,
    keywords = [],
    ogImage = `${SITE_URL}/og-image.png`,
    ogType = 'website',
    faqItems = [],
    breadcrumbs = [],
    structuredData,
}: SEOHeadProps) {
    const canonicalUrl = canonical || SITE_URL

    // Build FAQ schema
    const faqSchema = faqItems.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    } : null

    // Build BreadcrumbList schema
    const breadcrumbSchema = breadcrumbs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    } : null

    // SoftwareApplication schema (for converter pages)
    const appSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: description,
        url: canonicalUrl,
    }

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Robots */}
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(appSchema)}
            </script>

            {faqSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            )}

            {breadcrumbSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            )}

            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    )
}
