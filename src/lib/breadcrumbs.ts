export interface BreadcrumbItem {
  name: string;
  path: string; // site-relative, e.g. '/faq' or '/ro/faq'
}

/** BreadcrumbList JSON-LD. Home is always position 1; pass the trailing pages after it. */
export function buildBreadcrumbJsonLd(site: string, items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: site + item.path,
    })),
  };
}
