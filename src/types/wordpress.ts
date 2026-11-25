export interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  terms: TaxonomyTerm[];
}

export interface CustomField {
  key: string;
  label: string;
  type: string;
  defaultValue?: string | number;
}

export interface ContentType {
  id: string;
  slug: string;
  name: string;
  taxonomies: Taxonomy[];
  customFields: CustomField[];
  isScanned: boolean;
}

export interface WordPressSite {
  id: string;
  name: string;
  url: string;
  username: string;
  applicationPassword?: string;
  status: 'CONNECTED' | 'ERROR';
  totalArticles: number;
  lastScanned?: string;
  discoveredTypes: ContentType[];
}
