(() => {
  const siteUrl = "https://danitellez.es";
  const pageUrl = document.querySelector('link[rel="canonical"]')?.href;
  if (!pageUrl) return;

  const personId = `${siteUrl}/#dani-tellez`;
  const agencyId = `${siteUrl}/#lis-talent`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        "name": "Dani Téllez",
        "alternateName": "Dani Tellez",
        "url": siteUrl,
        "image": `${siteUrl}/assets/images/optimized/bio-portrait.jpg`,
        "jobTitle": "Actor de cine, televisión y teatro",
        "email": "danitellez.dev@gmail.com",
        "description": "Actor español con base en Andalucía, disponible para trabajar en toda España e internacionalmente.",
        "knowsLanguage": ["es", "en"],
        "homeLocation": { "@type": "Place", "name": "Andalucía, España" },
        "areaServed": [
          { "@type": "Country", "name": "España" },
          { "@type": "Place", "name": "Internacional" }
        ],
        "sameAs": [
          "https://www.instagram.com/dani_tellez7/",
          "https://www.imdb.com/es-es/name/nm12949652/",
          "https://listalent.com/dani-tellez/"
        ],
        "agent": { "@id": agencyId }
      },
      {
        "@type": "Organization",
        "@id": agencyId,
        "name": "LIS Talent",
        "url": "https://listalent.com/dani-tellez/",
        "sameAs": ["https://listalent.com/"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": `${siteUrl}/`,
        "name": "Dani Téllez — Actor",
        "inLanguage": "es-ES",
        "publisher": { "@id": personId }
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        "url": pageUrl,
        "name": document.title,
        "isPartOf": { "@id": `${siteUrl}/#website` },
        "about": { "@id": personId },
        "inLanguage": "es-ES"
      }
    ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(graph);
  document.head.append(script);
})();
