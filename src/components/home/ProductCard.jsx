import React from 'react';
import { cn } from '../ui/Button';
import { resolveImageUrl } from '../../utils/imageUrl';
import coinsImage from '../../assets/logo.webp';
import UnavailableLockOverlay from '../products/UnavailableLockOverlay';

const ProductCard = ({
  product,
  categoryLabel,
  priceLabel,
  buyLabel,
  secondaryLabel,
  secondaryTo,
  isRTL,
}) => {
  const productName = product.displayName;
  const isUnavailable = product.storefrontStatus?.isPurchasable === false;
  const unavailableLabel = product.storefrontStatus?.badgeLabel || (isRTL ? 'غير متاح' : 'Unavailable');

  return (
    <article className={cn('group relative isolate flex flex-col', isUnavailable && 'cursor-not-allowed')}>
      {isUnavailable ? (
        <span className="pointer-events-none absolute inset-0 z-10 rounded-[1rem] bg-black/38" aria-hidden="true" />
      ) : null}
      <div className="relative overflow-hidden rounded-[1rem]">
        <img
          src={product.image ? resolveImageUrl(product.image) : coinsImage}
          alt={productName}
          className={cn(
            'aspect-square w-full object-cover transition duration-500 group-hover:scale-105',
            isUnavailable && 'brightness-[0.42] grayscale-[0.18]'
          )}
        />
        {isUnavailable && (
          <div className="absolute inset-0 z-20 bg-black/22">
            <UnavailableLockOverlay label={unavailableLabel} size="md" />
          </div>
        )}
      </div>

      <h3 className="relative z-20 mt-2 line-clamp-2 text-center text-xs font-semibold leading-5 text-[var(--color-text)]">
        {productName}
      </h3>
    </article>
  );
};

export default ProductCard;
