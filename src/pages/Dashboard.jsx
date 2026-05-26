import React, { useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, Target } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import HeroSlider from '../components/home/HeroSlider';
import CategoryCard from '../components/home/CategoryCard';
import ProductSearchBar from '../components/products/ProductSearchBar';
import slideOneHeroImage from '../assets/slide-1.webp';
import slideTwoHeroImage from '../assets/slide-2.webp';
import slideThreeHeroImage from '../assets/slide-3.webp';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  getStorefrontLanguage,
} from '../utils/storefront';

const Dashboard = () => {
  const { user, refreshProfile } = useAuthStore();
  const { categories, products, loadProducts } = useMediaStore();
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = getStorefrontLanguage(i18n);
  const isTwoFactorEnabled = Boolean(user?.twoFactorEnabled ?? user?.isTwoFactorEnabled);
  const isCustomerUser = String(user?.role || '').trim().toLowerCase() === 'customer';

  useEffect(() => {
    if (refreshProfile) refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    loadProducts({ force: false });
  }, [loadProducts]);

  const whatsappChannelUrl = 'https://whatsapp.com/channel/0029Vb5xkFpFMqrUmvTSil0Q';
  const heroSlides = useMemo(() => ([
    { id: 'landing-slide-1', image: slideOneHeroImage, title: '' },
    { id: 'landing-slide-2', image: slideTwoHeroImage, title: '', href: whatsappChannelUrl },
    { id: 'landing-slide-3', image: slideThreeHeroImage, title: '' },
  ]), []);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, {
      language,
      userGroup: user?.groupId || user?.group || 'Normal',
      userGroupPercentage: user?.groupPercentage ?? null,
    }),
    [groupsLastLoadedAt, language, products, user?.group, user?.groupId, user?.groupPercentage]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language),
    [categories, storefrontProducts, language]
  );

  const visibleHomepageCategories = useMemo(
    () => storefrontCategories.filter((category) => {
      if (category.id === 'all') return false;
      const p = category.parentCategory;
      if (!p) return true;
      if (typeof p === 'string' && !p.trim()) return true;
      return false;
    }),
    [storefrontCategories]
  );

  const handleCategorySelect = useCallback((categoryId) => {
    navigate(categoryId === 'all' ? '/products' : `/products?category=${encodeURIComponent(categoryId)}`);
  }, [navigate]);

  const handleProductSelect = useCallback((product) => {
    const next = new URLSearchParams();
    if (product?.category) next.set('category', product.category);
    next.set('request', product.id);
    navigate(`/products?${next.toString()}`);
  }, [navigate]);

  return (
    <div className="space-y-5 pb-5 sm:space-y-6">
      {!isTwoFactorEnabled ? (
        <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-[1rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[linear-gradient(135deg,rgb(var(--color-primary-rgb)/0.09),rgb(var(--color-card-rgb)/0.62))] px-2.5 py-2 shadow-[0_18px_44px_-36px_rgb(var(--color-primary-rgb)/0.58)] backdrop-blur-xl sm:px-3 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.24)] bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)] sm:h-8 sm:w-8">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <div className="min-w-0 truncate text-[0.72rem] font-semibold text-[var(--color-text-secondary)] sm:text-[0.82rem]">
                {language === 'ar' ? (
                  'حرصًا على أمان حسابك، فعّل المصادقة الثنائية.'
                ) : (
                  'For your account safety, enable two-factor authentication.'
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              <Link to="/account-security" className="inline-flex h-7 items-center justify-center rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.11)] px-2.5 text-[0.68rem] font-bold text-[var(--color-primary)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.44)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.16)] sm:h-8 sm:px-3 sm:text-[0.75rem]">
                {language === 'ar' ? 'فعّل الآن' : 'Enable now'}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <HeroSlider slides={heroSlides} />

      <section id="categories" className="scroll-mt-28 space-y-3 sm:space-y-3.5">
        <div className="relative z-10 mx-auto flex w-full max-w-5xl justify-center px-0.5 sm:px-2">
          <ProductSearchBar products={storefrontProducts} language={language} onSelectProduct={handleProductSelect} forceIconRight placeholder={language === 'ar' ? 'ابحث عن منتج...' : 'Search for a product...'} noResultsLabel={language === 'ar' ? 'لا يوجد منتج مطابق' : 'No matching product found'} className="mx-auto w-full" inputClassName="h-10 rounded-full" />
        </div>

        <div className="relative z-0 grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {visibleHomepageCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} active={false} index={index} onSelect={handleCategorySelect} />
          ))}
        </div>

      </section>

      {isCustomerUser ? (
        <div className="mx-auto w-full max-w-5xl px-0.5 sm:px-2">
          <Link
            to="/buy-target"
            className="group relative mx-auto flex w-full max-w-2xl items-center overflow-hidden rounded-2xl border border-[color:rgb(var(--color-primary-rgb)/0.24)] bg-[linear-gradient(135deg,rgb(var(--color-primary-rgb)/0.18),rgb(var(--color-accent-rgb)/0.10),rgb(var(--color-card-rgb)/0.86))] px-3 py-3 text-start shadow-[0_18px_46px_-34px_rgb(var(--color-primary-rgb)/0.8)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.44)] hover:shadow-[0_22px_58px_-34px_rgb(var(--color-primary-rgb)/0.95)] sm:px-4"
          >
            <span className="absolute inset-y-3 end-3 w-20 rounded-full bg-[radial-gradient(circle,rgb(var(--color-primary-rgb)/0.22),transparent_68%)] opacity-80 blur-xl transition-opacity group-hover:opacity-100" />

            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.14)] text-[var(--color-primary)] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
              <Target className="h-5 w-5" />
            </span>

            <span className="relative min-w-0 flex-1 px-3">
              <span className="block text-[0.98rem] font-black leading-6 text-[var(--color-text)]">
                {language === 'ar' ? 'بيع تارجت من حسابك' : 'Sell Target from your account'}
              </span>
            </span>

            <span className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3 text-[0.75rem] font-black text-[var(--color-primary-foreground)] shadow-[0_12px_24px_-18px_rgb(var(--color-primary-rgb)/0.9)]">
              <span>{language === 'ar' ? 'تفاصيل' : 'Details'}</span>
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </span>
          </Link>
        </div>
      ) : null}

    </div>
  );
};

export default Dashboard;
