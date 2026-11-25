import type { ContentType } from '../../types/wordpress';

export interface CreateWebsiteDto {
  name: string;
  url: string;
  username: string;
  applicationPassword?: string;
}

export interface UpdateWebsiteDto extends Partial<CreateWebsiteDto> {}

export interface WebsiteDto {
  id: string;
  name: string;
  url: string;
  username: string;
  status: 'CONNECTED' | 'ERROR';
  totalArticles: number;
  lastScanned?: string;
  discoveredTypes: ContentType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TestConnectionResultDto {
  success: boolean;
  statusCode: number;
  latencyMs: number;
  message: string;
}

export interface DiscoverContentTypesResultDto {
  siteId: string;
  discoveredTypes: ContentType[];
  scannedAt: string;
}
