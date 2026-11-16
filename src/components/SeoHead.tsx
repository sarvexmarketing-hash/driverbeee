import React, { useEffect } from 'react';
import { SeoMetadataProps, BreadcrumbItem } from '../types/seo';

/**
 * Production-grade SEO Head manager for React Router
 *
 * Dynamically updates document.title, canonical URL, meta tags,
 * Open Graph, Twitter cards, and JSON-LD structured data.
 */
export const SeoHead: React.FC<SeoMetadataProps> = ({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = 'https://driverbee.in/hero-driver-car.jpg',
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  robots = 'index, follow',
  jsonLd,
  breadcrumbs,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes('DriverBee') ? title : `${title} | DriverBee`;
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attribute: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);

    // 3. Canonical Link Tag (prevents duplicate indexing)
    setLinkTag('canonical', canonicalUrl);

    // 4. Open Graph Tags
    const effectiveOgTitle = ogTitle || formattedTitle;
    const effectiveOgDesc = ogDescription || description;
    const effectiveOgUrl = ogUrl || canonicalUrl;

    setMetaTag('property', 'og:title', effectiveOgTitle);
    setMetaTag('property', 'og:description', effectiveOgDesc);
    setMetaTag('property', 'og:url', effectiveOgUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'DriverBee');

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', effectiveOgTitle);
    setMetaTag('name', 'twitter:description', effectiveOgDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Structured Data (JSON-LD)
    const jsonLdElements: HTMLScriptElement[] = [];

    // Remove any previously dynamic injected JSON-LD scripts
    document.querySelectorAll('script[data-seo="driverbee-dynamic-jsonld"]').forEach((el) => {
      el.remove();
    });

    const injectJsonLd = (schemaData: Record<string, any>) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'driverbee-dynamic-jsonld');
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);
      jsonLdElements.push(script);
    };

    // Custom provided schema
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        jsonLd.forEach((item) => injectJsonLd(item));
      } else {
        injectJsonLd(jsonLd);
      }
    }

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.label,
          item: crumb.url.startsWith('http') ? crumb.url : `https://driverbee.in${crumb.url}`,
        })),
      };
      injectJsonLd(breadcrumbSchema);
    }

    return () => {
      // Clean up injected dynamic schema on unmount
      jsonLdElements.forEach((el) => el.remove());
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    robots,
    jsonLd,
    breadcrumbs,
  ]);

  return null;
};
