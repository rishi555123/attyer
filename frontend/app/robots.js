export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/profile/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.attyer.com'}/sitemap.xml`,
  }
}
