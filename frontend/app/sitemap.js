import axios from 'axios';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.attyer.com';

  try {
    // Fetch all product slugs for dynamic routes
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products`);
    const products = res.data.data;

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug || product._id}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...productUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      { url: baseUrl, lastModified: new Date() },
    ];
  }
}
