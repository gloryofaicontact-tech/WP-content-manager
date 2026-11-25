import type { WordPressSite, ContentType } from '../types/wordpress';

export const mockDefaultContentTypes: ContentType[] = [
  {
    id: 'post',
    slug: 'posts',
    name: 'Standard Posts',
    isScanned: true,
    taxonomies: [
      {
        id: 'category',
        name: 'Categories',
        slug: 'categories',
        terms: [
          { id: 1, name: 'Travel Guides', slug: 'travel-guides' },
          { id: 2, name: 'Wildlife & Safari', slug: 'wildlife-safari' },
          { id: 3, name: 'Cultural Heritage', slug: 'cultural-heritage' },
          { id: 4, name: 'Beaches & Surfing', slug: 'beaches-surfing' },
          { id: 5, name: 'Eco-Tourism', slug: 'eco-tourism' },
        ],
      },
      {
        id: 'post_tag',
        name: 'Tags',
        slug: 'tags',
        terms: [
          { id: 101, name: 'Ella', slug: 'ella' },
          { id: 102, name: 'Yala', slug: 'yala' },
          { id: 103, name: 'Sigiriya', slug: 'sigiriya' },
          { id: 104, name: 'Blue Train', slug: 'blue-train' },
          { id: 105, name: 'Highlands', slug: 'highlands' },
        ],
      },
    ],
    customFields: [],
  },
  {
    id: 'tour-package',
    slug: 'tour-packages',
    name: 'Tour Packages (CPT)',
    isScanned: true,
    taxonomies: [
      {
        id: 'tour_category',
        name: 'Tour Categories',
        slug: 'tour-categories',
        terms: [
          { id: 201, name: 'Wild Safari Expedition', slug: 'safari' },
          { id: 202, name: 'Cultural Triangle Tour', slug: 'cultural' },
          { id: 203, name: 'Luxury Hill Country Escape', slug: 'hill-country' },
        ],
      },
    ],
    customFields: [
      { key: 'price', label: 'Starting Price ($ USD)', type: 'number', defaultValue: 650 },
      { key: 'duration', label: 'Duration (Days / Nights)', type: 'text', defaultValue: '5 Days / 4 Nights' },
    ],
  },
  {
    id: 'destination',
    slug: 'destinations',
    name: 'Destinations (CPT)',
    isScanned: true,
    taxonomies: [
      {
        id: 'region',
        name: 'Geographic Region',
        slug: 'region',
        terms: [
          { id: 301, name: 'Central Highlands', slug: 'central-highlands' },
          { id: 302, name: 'Southern Coast', slug: 'southern-coast' },
          { id: 303, name: 'Cultural Triangle', slug: 'cultural-triangle' },
        ],
      },
    ],
    customFields: [
      { key: 'best_time', label: 'Best Time to Visit', type: 'text', defaultValue: 'December to April' },
    ],
  },
];

export const mockSites: WordPressSite[] = [
  {
    id: 'site-1',
    name: 'QuickSite TestSpace',
    url: 'https://testspace.quicksite.asia',
    username: 'itadmin',
    applicationPassword: '•••• •••• •••• ••••',
    status: 'CONNECTED',
    totalArticles: 18,
    lastScanned: 'Today, 2:30 PM',
    discoveredTypes: mockDefaultContentTypes,
  },
  {
    id: 'site-2',
    name: 'Ceylon Travel Blog',
    url: 'https://ceylonexpeditions.travel',
    username: 'editor_wp',
    applicationPassword: '•••• •••• •••• ••••',
    status: 'CONNECTED',
    totalArticles: 12,
    lastScanned: 'Yesterday, 10:15 AM',
    discoveredTypes: [mockDefaultContentTypes[0], mockDefaultContentTypes[1]],
  },
  {
    id: 'site-3',
    name: 'Wild Safari Sri Lanka',
    url: 'https://wildsafari.asia',
    username: 'safari_admin',
    applicationPassword: '•••• •••• •••• ••••',
    status: 'CONNECTED',
    totalArticles: 8,
    lastScanned: '3 days ago',
    discoveredTypes: [mockDefaultContentTypes[0]],
  },
];
