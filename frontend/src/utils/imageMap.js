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

const buildCropImagePath = (value) => {
  const normalized = normalizeKey(value);
  if (!normalized) return defaultCropImage;
  return `/cropimages/${encodeURIComponent(normalized)}.jpeg`;
};

export const getCropImageByName = (value) => {
  return buildCropImagePath(value);
};

export const getCropImageFromSrc = (src) => {
  if (!src) return defaultCropImage;
  if (typeof src !== 'string') return defaultCropImage;
  const trimmed = src.trim();
  if (!trimmed) return defaultCropImage;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return buildCropImagePath(trimmed);
};
