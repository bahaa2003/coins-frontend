import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import HeroSlider from '../components/home/HeroSlider';
import CategoryCard from '../components/home/CategoryCard';
import ProductSearchBar from '../components/products/ProductSearchBar';
import ProductPurchaseDialog from '../components/products/ProductPurchaseDialog';
import UnavailableLockOverlay from '../components/products/UnavailableLockOverlay';
import slideOneHeroImage from '../assets/slide-1.webp';
import slideTwoHeroImage from '../assets/slide-2.webp';
import slideThreeHeroImage from '../assets/slide-3.webp';
import targetBannerImage from '../assets/ترجتات.jpg';
import coinsImage from '../assets/logo.webp';
import { resolveImageUrl } from '../utils/imageUrl';
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
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const categoryChildrenByParent = useMemo(() => (
    storefrontCategories.reduce((map, category) => {
      const parentId = String(category?.parentCategory || '').trim();
      if (!parentId) return map;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId).push(category.id);
      return map;
    }, new Map())
  ), [storefrontCategories]);

  const collectCategoryIds = useCallback((categoryId) => {
    const seen = new Set();
    const stack = [String(categoryId || '').trim()].filter(Boolean);
    while (stack.length) {
      const currentId = stack.pop();
      if (!currentId || seen.has(currentId)) continue;
      seen.add(currentId);
      (categoryChildrenByParent.get(currentId) || []).forEach((childId) => {
        if (!seen.has(childId)) stack.push(childId);
      });
    }
    return seen;
  }, [categoryChildrenByParent]);

  const bestSellingProducts = useMemo(() => {
    const firstCategory = visibleHomepageCategories[0];
    const secondCategory = visibleHomepageCategories[1];
    const pickedIds = new Set();

    const pickFromCategory = (category, limit) => {
      if (!category) return [];
      const categoryIds = collectCategoryIds(category.id);
      const selected = [];

      for (const product of storefrontProducts) {
        if (selected.length >= limit) break;
        if (!categoryIds.has(String(product?.category || '').trim())) continue;
        if (pickedIds.has(product.id)) continue;
        pickedIds.add(product.id);
        selected.push(product);
      }

      return selected;
    };

    return [
      ...pickFromCategory(firstCategory, 4),
      ...pickFromCategory(secondCategory, 4),
    ];
  }, [collectCategoryIds, storefrontProducts, visibleHomepageCategories]);

  const handleCategorySelect = useCallback((categoryId) => {
    navigate(categoryId === 'all' ? '/products' : `/products?category=${encodeURIComponent(categoryId)}`);
  }, [navigate]);

  const handleProductSelect = useCallback((product) => {
    const next = new URLSearchParams();
    if (product?.category) next.set('category', product.category);
    next.set('request', product.id);
    navigate(`/products?${next.toString()}`);
  }, [navigate]);

  const openPurchaseDialog = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const closePurchaseDialog = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const viewCreatedOrder = useCallback((orderId) => {
    setSelectedProduct(null);
    navigate(`/orders/${encodeURIComponent(orderId)}`);
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
            className="group mx-auto block w-full max-w-3xl overflow-hidden rounded-[1.1rem] border border-[color:rgb(var(--color-primary-rgb)/0.24)] bg-[color:rgb(var(--color-card-rgb)/0.72)] shadow-[0_18px_44px_-34px_rgb(var(--color-primary-rgb)/0.72)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.42)] hover:shadow-[0_22px_54px_-36px_rgb(var(--color-primary-rgb)/0.9)]"
            aria-label={language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
          >
            <span className="block overflow-hidden bg-black">
              <img
                src={targetBannerImage}
                alt={language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
                className="block aspect-[2048/800] w-full object-cover transition-transform duration-500 group-hover:scale-[1.012]"
                loading="lazy"
              />
            </span>
            <span className="block border-t border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/0.9),rgb(var(--color-surface-rgb)/0.68))] px-3 py-2 text-center">
              <span className="text-sm font-extrabold text-[var(--color-text)] sm:text-base">
                {language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
              </span>
            </span>
          </Link>
        </div>
      ) : null}

      {bestSellingProducts.length ? (
        <section className="mx-auto w-full max-w-5xl space-y-3 px-0.5 sm:px-2" aria-labelledby="best-selling-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="best-selling-title" className="text-base font-black text-[var(--color-text)] sm:text-lg">
              {language === 'ar' ? 'الأكثر مبيعا' : 'Best selling'}
            </h2>
            <Link to="/products" className="text-xs font-bold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)] sm:text-sm">
              {language === 'ar' ? 'عرض الكل' : 'View all'}
            </Link>
          </div>

          <div
            className="scrollbar-hide flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth pb-1 sm:gap-3"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {bestSellingProducts.map((product) => {
              const productName = product.displayName || product.nameAr || product.name || '';
              const imageSrc = product.image ? resolveImageUrl(product.image) : coinsImage;
              const isUnavailable = product.storefrontStatus?.isPurchasable === false;
              const unavailableLabel = product.storefrontStatus?.badgeLabel || (language === 'ar' ? 'غير متاح' : 'Unavailable');

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    if (!isUnavailable) openPurchaseDialog(product);
                  }}
                  disabled={isUnavailable}
                  className={`group relative isolate min-w-[38%] snap-start rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.7)] bg-[color:rgb(var(--color-card-rgb)/0.76)] p-2 text-center shadow-[0_14px_34px_-30px_rgb(var(--color-primary-rgb)/0.7)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.32)] min-[430px]:min-w-[30%] sm:min-w-[22%] lg:min-w-[17%] ${isUnavailable ? 'cursor-not-allowed hover:translate-y-0' : ''}`}
                  aria-label={productName}
                >
                  {isUnavailable ? (
                    <span className="pointer-events-none absolute inset-0 z-10 rounded-[1rem] bg-black/38" aria-hidden="true" />
                  ) : null}
                  <span className="relative block overflow-hidden rounded-[0.85rem] bg-[color:rgb(var(--color-surface-rgb)/0.72)]">
                    <img
                      src={imageSrc}
                      alt={productName}
                      className={`aspect-square w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04] ${isUnavailable ? 'brightness-[0.42] grayscale-[0.18]' : ''}`}
                      loading="lazy"
                      decoding="async"
                    />
                    {isUnavailable ? (
                      <span className="absolute inset-0 z-20 bg-black/24 px-1.5 pt-2">
                        <UnavailableLockOverlay label={unavailableLabel} size="sm" />
                      </span>
                    ) : null}
                  </span>
                  <span className="relative z-20 mt-2 line-clamp-2 block min-h-[2.35rem] text-[0.72rem] font-bold leading-5 text-[var(--color-text)] sm:text-xs">
                    {productName}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <ProductPurchaseDialog
        isOpen={Boolean(selectedProduct)}
        productId={selectedProduct?.id}
        initialProduct={selectedProduct}
        onClose={closePurchaseDialog}
        onViewOrder={viewCreatedOrder}
      />

    </div>
  );
};

export default Dashboard;
