export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);

export const getEffectivePrice = (product) =>
  product?.discountPrice && product.discountPrice > 0
    ? product.discountPrice
    : product?.price || 0;

export const calcDiscountPercent = (product) => {
  if (!product?.discountPrice || product.discountPrice >= product.price) return 0;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
};

export const buildImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600/FFE0EC/D63A75?text=DS+Store';
  if (path.startsWith('http')) return path;
  return path; // /uploads/... is proxied by Vite to backend
};

export const truncate = (str = '', n = 60) =>
  str.length > n ? str.slice(0, n).trim() + '…' : str;
