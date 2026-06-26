import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, TrendingUp } from 'lucide-react';
import Button, { cn } from '../ui/Button';
import { resolveImageUrl } from '../../utils/imageUrl';
import coinsImage from '../../assets/logo.webp';
import UnavailableLockOverlay from './UnavailableLockOverlay';

const TopSellingCarousel = ({
  products,
  isRTL,
  buyLabel,
  categoryResolver,
  emptyTitle,
  emptyDescription,
  soldLabel,
  trendingLabel,
  onOpen,
}) => {
  const trackRef = useRef(null);
  const unavailableLabel = isRTL ? 'غير متاح' : 'Unavailable';

  const handleScroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const distance = Math.max(track.clientWidth * 0.82, 260);
    const horizontalStep = distance * direction * (isRTL ? -1 : 1);
    track.scrollBy({ left: horizontalStep, behavior: 'smooth' });
  };

  if (!products.length) {
    return (
      <div className="rounded-[1.75rem] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.94)] p-10 text-center shadow-[var(--shadow-subtle)]">
        <TrendingUp className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
        <p className="mt-4 text-lg font-semibold text-[var(--color-text)]">{emptyTitle}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="top-selling-showcase rounded-[1.45rem] border border-[color:rgb(var(--color-border-rgb)/0.75)] bg-[color:rgb(var(--color-card-rgb)/0.95)] p-3 shadow-[var(--shadow-subtle)] sm:p-4">
      <div className="mb-4 flex items-center justify-end gap-2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => handleScroll(-1)}
          aria-label={isRTL ? 'السابق' : 'Previous'}
        >
          {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => handleScroll(1)}
          aria-label={isRTL ? 'التالي' : 'Next'}
        >
          {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>

      <div
        ref={trackRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
      >
        {products.map((product, index) => {
          const isUnavailable = product.storefrontStatus?.isPurchasable === false;
          const resolvedUnavailableLabel = product.storefrontStatus?.badgeLabel || unavailableLabel;
          const actionClassName = cn(
            'glow-button mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-soft)_48%,var(--color-primary-hover))] px-4 text-sm font-semibold text-[var(--color-button-text)] shadow-[var(--shadow-gold)] transition-all hover:-translate-y-0.5',
            isUnavailable && 'cursor-not-allowed opacity-60 hover:translate-y-0'
          );

          return (
            <article
              key={product.id}
              className={cn(
                'product-led-card relative isolate snap-start min-w-[82%] p-3 sm:min-w-[48%] sm:p-4 lg:min-w-[31%]',
                'top-selling-card',
                isUnavailable && 'cursor-not-allowed'
              )}
            >
              {isUnavailable ? (
                <span className="pointer-events-none absolute inset-0 z-10 rounded-[1.75rem] bg-[linear-gradient(180deg,rgb(255_255_255/0.14),rgb(240_200_90/0.08))] dark:bg-[linear-gradient(180deg,rgb(255_255_255/0.06),rgb(29_149_168/0.08))]" aria-hidden="true" />
              ) : null}
              <div className="relative overflow-hidden rounded-[1.4rem]">
                <img
                  src={product.image ? resolveImageUrl(product.image) : coinsImage}
                  alt={product.displayName}
                  className={cn(
                    'aspect-[1.14] w-full object-cover transition duration-500',
                    isUnavailable && 'brightness-[0.92] saturate-[0.88]'
                  )}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.08)_0%,rgba(11,11,11,0.22)_38%,rgba(11,11,11,0.86)_100%)]" />
                {isUnavailable && (
                  <div className="absolute inset-0 z-20 bg-white/12 dark:bg-white/5">
                    <UnavailableLockOverlay label={resolvedUnavailableLabel} size="lg" />
                  </div>
                )}

                <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
                  <span className="max-w-[60%] truncate rounded-full border border-white/12 bg-black/28 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/78 backdrop-blur-md">
                    {categoryResolver(product)}
                  </span>
                  <span className="rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.16)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-hover)]">
                    {product.salesCount > 0 ? `${product.salesCount} ${soldLabel}` : trendingLabel}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/58">#{index + 1}</p>
                    <p className="mt-1 text-xl font-semibold gold-gradient-text">{product.formattedPrice}</p>
                  </div>
                </div>
              </div>

              <div className="relative z-20 pt-4">
                <h3 className="line-clamp-2 text-base font-semibold text-[var(--color-text)] sm:text-lg">
                  {product.displayName}
                </h3>

                {isUnavailable ? (
                  <button
                    type="button"
                    className={actionClassName}
                    disabled
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {resolvedUnavailableLabel}
                  </button>
                ) : (
                  onOpen ? (
                    <button
                      type="button"
                      onClick={() => onOpen(product)}
                      className={actionClassName}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {buyLabel}
                    </button>
                  ) : (
                    <Link
                      to={`/products/${product.id}`}
                      className={actionClassName}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {buyLabel}
                    </Link>
                  )
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default TopSellingCarousel;
