export const cropImages = {
  barley: '/cropimages/barley.jpeg',
  beans: '/cropimages/beans.jpeg',
  castor: '/cropimages/Castor.jpeg',
  cotton: '/cropimages/cotton.jpeg',
  default: '/cropimages/default.jpeg',
  groundnut: '/cropimages/groundnut.jpeg',
  maize: '/cropimages/maize.jpeg',
  mirchi: '/cropimages/mirchi.jpeg',
  onion: '/cropimages/onion.jpeg',
  potato: '/cropimages/potato.jpeg',
  rice: '/cropimages/rice.jpeg',
  paddy: '/cropimages/rice.jpeg',
  sesame: '/cropimages/Sesame.jpeg',
  'sugar cane': '/cropimages/sugar cane.jpeg',
  sugarcane: '/cropimages/sugar cane.jpeg',
  sunflower: '/cropimages/sunflower.jpeg',
  tomato: '/cropimages/tomato.jpeg',
  turmeric: '/cropimages/turmeric.jpeg',
  wheat: '/cropimages/wheat.jpeg',
};

export const defaultCropImage = '/cropimages/default.jpeg';

const normalizeKey = (value) => {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\.(jpe?g|png)$/i, '');
};

export const getCropImageByName = (value) => {
  const normalized = normalizeKey(value);
  if (!normalized) return defaultCropImage;
  if (cropImages[normalized]) return cropImages[normalized];
  return defaultCropImage;
};

export const getCropImageFromSrc = (src) => {
  if (!src) return defaultCropImage;
  if (typeof src !== 'string') return defaultCropImage;
  const trimmed = src.trim();
  if (!trimmed) return defaultCropImage;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  const normalized = normalizeKey(trimmed);
  if (cropImages[normalized]) return cropImages[normalized];
  return defaultCropImage;
};
