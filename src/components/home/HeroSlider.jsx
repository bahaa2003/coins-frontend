import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const HeroSlider = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { i18n } = useTranslation();
  const hasMultipleSlides = (slides?.length || 0) > 1;
  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const verseText = isArabic
    ? 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُمْ بَيْنَكُمْ بِالْبَاطِلِ إِلَّا أَنْ تَكُونَ تِجَارَةً عَنْ تَرَاضٍ مِنْكُمْ ﴾ صَدَقَ اللَّهُ الْعَظِيمُ'
    : 'In the name of Allah, the Most Gracious, the Most Merciful. Do not consume one another’s wealth unjustly, but only through trade by mutual consent.';

  useEffect(() => {
    if (!hasMultipleSlides) return undefined;

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, slides]);

  if (!slides?.length) return null;

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const slide = slides[currentSlide];
  const sizingSlide = slides[0] || slide;
  const SlideFrame = slide.href ? 'a' : 'div';
  const slideFrameProps = slide.href
    ? {
      href: slide.href,
      target: '_blank',
      rel: 'noreferrer',
      'aria-label': slide.alt || slide.title || (isArabic ? 'فتح الرابط' : 'Open link'),
    }
    : {};

  return (
    <div className="mx-auto w-full max-w-5xl space-y-1.5 sm:space-y-2">
      <section className="relative overflow-hidden rounded-[1.35rem] border border-[color:rgb(var(--color-border-rgb)/0.64)] bg-[color:rgb(var(--color-card-rgb)/0.68)] shadow-[var(--shadow-subtle)] sm:rounded-[1.65rem]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_32%)]" />
        <img
          src={sizingSlide.image}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="invisible block h-auto w-full"
        />
        <div className="absolute inset-0 animate-[fade-in_0.32s_ease-out] motion-reduce:animate-none">
          <SlideFrame {...slideFrameProps} className="block h-full w-full">
            <img
              src={slide.image}
              alt={slide.alt || ''}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              sizes="100vw"
              className="block h-full w-full object-cover"
            />
          </SlideFrame>
        </div>

        {hasMultipleSlides ? (
          <div className="absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1.5 sm:bottom-3">
            {slides.map((item, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={item.id || index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={[
                    'h-1.5 rounded-full border transition-all duration-300',
                    isActive
                      ? 'w-7 border-[color:rgb(var(--color-primary-rgb)/0.86)] bg-[var(--color-primary)] shadow-[0_0_16px_rgb(var(--color-primary-rgb)/0.55)]'
                      : 'w-1.5 border-white/28 bg-white/42 hover:w-4 hover:border-white/60 hover:bg-white/70',
                  ].join(' ')}
                  aria-label={isArabic ? `اذهب إلى الصورة ${index + 1}` : `Go to slide ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                />
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="px-1 sm:px-1.5">
        <div className="marquee-wrap" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="marquee-track-smooth">
            <span className="marquee-chunk text-[11px] font-semibold tracking-[0.02em] text-[var(--color-text)] sm:text-[12px]">
              {verseText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
