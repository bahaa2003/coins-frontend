import React from 'react';
import { cn } from '../ui/Button';

const ProductCardSimple = React.memo(({
  product,
  categoryLabel,
  onOpen,
  showCategory = false,
  buyLabel = 'Buy now',
  unavailableLabel = 'غير متاح',
}) => {
  const isUnavailable = product.storefrontStatus?.isPurchasable === false;
  const imageSrc = String(product.image || '').trim();
  const arabicName = product.nameAr || product.displayName || product.name || 'Product';
  const englishName = product.name || product.externalProductName || product.nameAr || '';
  const displayName = arabicName;

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="storefront-product-card group relative isolate flex w-full origin-center select-none flex-col rounded-[1.25rem] p-2 text-start transition-all duration-200 ease-out hover:-translate-y-0.5"
      aria-label={displayName}
    >
      <div className="storefront-product-media relative overflow-hidden rounded-[1rem]">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={displayName}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 24vw, 18vw"
            className={cn(
              'relative block aspect-square h-full w-full bg-transparent object-contain object-center p-2 transition duration-500 group-hover:scale-[1.04]',
              isUnavailable && 'brightness-[0.42] grayscale-[0.18]'
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className={cn(
              'relative grid aspect-square h-full w-full place-items-center rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-surface-rgb)/0.72)] text-2xl font-black text-[var(--color-text-secondary)] transition duration-500 group-hover:scale-[1.03]',
              isUnavailable && 'brightness-[0.42] grayscale-[0.18]'
            )}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        {isUnavailable && (
          <div className="absolute inset-0 grid place-items-center bg-black/24 px-2">
            <span className="rounded-full border border-white/22 bg-black/60 px-2.5 py-1 text-[11px] font-black text-white shadow-[0_10px_28px_-18px_rgb(0_0_0/0.9)] backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-xs">
              {unavailableLabel}
            </span>
          </div>
        )}
      </div>

      <div className="storefront-product-title mt-2 w-full text-center transition-colors duration-200 group-hover:text-[var(--color-primary)]">
        <h3 className="line-clamp-1 text-[0.78rem] font-bold leading-5 text-[var(--color-text)] sm:text-sm" dir="rtl">
          {arabicName}
        </h3>
        {englishName && englishName !== arabicName ? (
          <p className="line-clamp-1 text-[0.68rem] font-semibold leading-4 text-[var(--color-text-secondary)]" dir="ltr">
            {englishName}
          </p>
        ) : null}
      </div>
    </button>
  );
});

ProductCardSimple.displayName = 'ProductCardSimple';

export default ProductCardSimple;
