import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, canonicalUrl }) => {
  const siteName = 'First Steps School';
  const defaultTitle = `${siteName} - Empowering Young Minds`;
  const defaultDescription = 'First Steps School is dedicated to providing quality education and nurturing the potential of every student.';
  const baseUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
  
  const fullTitle = title ? `${title} - ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const canonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
    </Helmet>
  );
};

export default SEO;
