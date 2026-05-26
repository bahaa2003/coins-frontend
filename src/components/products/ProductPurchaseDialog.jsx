import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, FileText, LockKeyhole, Package, UserRound, WalletCards, X } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import useMediaStore from '../../store/useMediaStore';
import useOrderStore from '../../store/useOrderStore';
import useSystemStore from '../../store/useSystemStore';
import apiClient from '../../services/client';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import {
  calculateProductPrice,
  formatCurrencyAmount,
  getCurrencyMeta,
  resolveProductUnitPrice,
} from '../../utils/pricing';
import { getReadableErrorMessage } from '../../utils/errorMessages';
import {
  getProductQuantityMeta,
  resolveProductOrderFields,
  sanitizeOrderFieldValue,
} from '../../utils/productPurchase';
import { normalizeMoneyAmount } from '../../utils/money';
import { devLogger } from '../../utils/devLogger';
import './ProductPurchaseDialog.css';

const getCopy = (language = 'ar') => (
  language === 'en'
    ? {
        available: 'Available',
        unavailable: 'Unavailable',
        unitPrice: 'Unit Price',
        agentProductId: 'Agent ID',
        accountNumber: 'Account Number',
        total: 'Total',
        quantity: 'Quantity',
        quantityPlaceholder: 'Enter quantity',
        minQuantity: 'Min',
        maxQuantity: 'Max',
        userId: 'User ID',
        userIdPlaceholder: 'Enter your user ID',
        buyNow: 'Buy Now',
        buying: 'Processing...',
        cancel: 'Cancel',
        successTitle: 'Purchase completed successfully',
        orderNumber: 'Order Number',
        product: 'Product',
        status: 'Order Status',
        orderDetails: 'View Order Details',
        later: 'Later',
        copied: 'Order number copied',
        accountCopied: 'Account number copied',
        emptyQuantity: 'Enter quantity.',
        belowMin: 'Quantity is below the minimum.',
        aboveMax: 'Quantity is above the maximum.',
        emptyUserId: 'User ID is required.',
        insufficientBalance: 'Insufficient balance.',
        loading: 'Loading product...',
        fallbackStatus: 'Processing',
      }
    : {
        available: 'متاح',
        unavailable: 'غير متاح',
        unitPrice: 'سعر الوحدة',
        agentProductId: 'رقم آيدي الوكيل',
        accountNumber: 'رقم الحساب',
        total: 'الإجمالي',
        quantity: 'الكمية',
        quantityPlaceholder: 'أدخل الكمية',
        minQuantity: 'أقل كمية',
        maxQuantity: 'أقصى كمية',
        userId: 'معرف المستخدم',
        userIdPlaceholder: 'أدخل معرف المستخدم',
        buyNow: 'شراء',
        buying: 'جاري التنفيذ...',
        cancel: 'إلغاء',
        successTitle: 'تم الشراء بنجاح',
        orderNumber: 'رقم الطلب',
        product: 'المنتج',
        status: 'حالة الطلب',
        orderDetails: 'عرض تفاصيل الطلب',
        later: 'لاحقًا',
        copied: 'تم نسخ رقم الطلب',
        accountCopied: 'تم نسخ رقم الحساب',
        emptyQuantity: 'أدخل الكمية.',
        belowMin: 'الكمية أقل من الحد الأدنى.',
        aboveMax: 'الكمية أكبر من الحد الأقصى.',
        emptyUserId: 'معرف المستخدم مطلوب.',
        insufficientBalance: 'الرصيد غير كافي.',
        loading: 'جاري تحميل المنتج...',
        fallbackStatus: 'قيد التنفيذ',
      }
);

const formatCount = (value) => Number(value || 0).toLocaleString('en-US');
const isUploadFieldType = (type) => ['image', 'file'].includes(String(type || '').trim().toLowerCase());

const ProductImage = ({ product }) => {
  if (product?.image) {
    return <img src={resolveImageUrl(product.image)} alt={product?.name || ''} />;
  }

  return <Package className="h-12 w-12" strokeWidth={1.8} />;
};

const SummaryCell = ({ label, value, icon, onClick, title }) => {
  const content = (
    <>
      <span>{icon}</span>
      <p>{label}</p>
      <strong dir="auto">{value}</strong>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="purchase-dialog-summary-cell is-clickable" onClick={onClick} title={title}>
        {content}
      </button>
    );
  }

  return (
    <div className="purchase-dialog-summary-cell">
      {content}
    </div>
  );
};

const SummaryPair = ({ left, right }) => (
  <div className="purchase-dialog-summary-pair">
    <SummaryCell {...left} />
    <SummaryCell {...right} />
  </div>
);

const SummaryRow = ({ label, value, icon, onClick, title }) => (
  <div className="purchase-dialog-summary-row">
    <span>{icon}</span>
    <p>{label}</p>
    <strong dir="auto">{value}</strong>
  </div>
);

const ProductPurchaseDialog = ({ productId, initialProduct = null, isOpen, onClose, onViewOrder }) => {
  const { language, dir } = useLanguage();
  const { addToast } = useToast();
  const copy = useMemo(() => getCopy(language), [language]);

  const user = useAuthStore((state) => state.user);
  const updateUserSession = useAuthStore((state) => state.updateUserSession);
  const products = useMediaStore((state) => state.products);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const currencies = useSystemStore((state) => state.currencies);
  const loadCurrencies = useSystemStore((state) => state.loadCurrencies);
  const addOrder = useOrderStore((state) => state.addOrder);

  const [product, setProduct] = useState(initialProduct);
  const [quantityInput, setQuantityInput] = useState('');
  const [userId, setUserId] = useState('');
  const [orderFieldValues, setOrderFieldValues] = useState({});
  const [orderFieldFiles, setOrderFieldFiles] = useState({});
  const [formError, setFormError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(productId && !initialProduct));
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setProduct(initialProduct || null);
    setQuantityInput('');
    setUserId('');
    setOrderFieldValues({});
    setOrderFieldFiles({});
    setFormError('');
    setServerError('');
    setSuccessOrder(null);
  }, [initialProduct, isOpen, productId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    if (!currencies || currencies.length === 0) {
      loadCurrencies();
    }
    return undefined;
  }, [currencies, isOpen, loadCurrencies]);

  useEffect(() => {
    if (!isOpen || !productId) return undefined;

    let isActive = true;
    const loadProduct = async () => {
      const cachedProduct = initialProduct
        || (useMediaStore.getState().products || products || []).find((item) => String(item.id) === String(productId));

      if (cachedProduct) {
        setProduct(cachedProduct);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        await loadProducts({ force: true, bypassCache: true });
        if (!isActive) return;
        const freshProduct = (useMediaStore.getState().products || []).find((item) => String(item.id) === String(productId));
        if (freshProduct) {
          setProduct(freshProduct);
        }
      } catch (error) {
        devLogger.error('Failed to load product', error);
        if (!cachedProduct) {
          setServerError(getReadableErrorMessage(error, copy.loading, { language }));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();
    return () => {
      isActive = false;
    };
  }, [copy.loading, initialProduct, isOpen, language, loadProducts, productId, products]);

  const quantityMeta = useMemo(() => (product ? getProductQuantityMeta(product) : null), [product]);
  const orderFields = useMemo(() => (product ? resolveProductOrderFields(product, language) : []), [language, product]);

  const userCurrencyCode = String(user?.currency || 'USD').toUpperCase();
  const pricingGroup = user?.groupId || user?.group || 'Normal';
  const pricingGroupPercentage = user?.groupPercentage ?? null;
  const unitPriceBase = product ? calculateProductPrice(product, pricingGroup, pricingGroupPercentage) : '0';
  const unitPrice = product ? resolveProductUnitPrice(product, userCurrencyCode, currencies, pricingGroup, pricingGroupPercentage) : '0';
  const quantity = Number.parseInt(quantityInput, 10);
  const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
  const totalPrice = normalizeMoneyAmount(Number(unitPrice) * safeQuantity);
  const balance = normalizeMoneyAmount(user?.coins || 0);
  const locale = language === 'en' ? 'en-US' : 'ar-EG';
  const formattedUnitPrice = formatCurrencyAmount(unitPrice, userCurrencyCode, currencies, locale);
  const formattedTotalPrice = formatCurrencyAmount(totalPrice, userCurrencyCode, currencies, locale);
  const agentProductId = String(
    product?.providerProductId
    || product?.externalProductId
    || product?.providerProduct
    || product?.supplierProductId
    || product?.supplierProductCode
    || product?.rawPayload?.product_id
    || product?.rawPayload?.productId
    || product?.rawPayload?.id
    || ''
  ).trim();
  const configuredAccountNumber = String(
    product?.displayAccountNumber
    || product?.purchaseAccountNumber
    || product?.accountNumber
    || product?.productAccountNumber
    || ''
  ).trim();
  const shouldShowAccountNumber = Boolean(
    product?.showPurchaseAccountNumber
    ?? product?.showAccountNumber
    ?? product?.displayAccountNumber
    ?? false
  );
  const displayedAccountNumber = shouldShowAccountNumber
    ? (configuredAccountNumber || agentProductId)
    : '';
  const isPurchasable = product?.storefrontStatus?.isPurchasable !== false;
  const statusLabel = isPurchasable
    ? (product?.storefrontStatus?.label || copy.available)
    : (product?.storefrontStatus?.label || copy.unavailable);

  const primaryOrderField = orderFields.find((field) => String(field?.key || '').toLowerCase() === 'playerid')
    || orderFields.find((field) => !isUploadFieldType(field?.type))
    || { key: 'playerId', label: copy.userId, placeholder: copy.userIdPlaceholder };
  const primaryOrderFieldKey = String(primaryOrderField?.key || 'playerId').trim() || 'playerId';
  const primaryOrderFieldLabel = primaryOrderField?.label || copy.userId;
  const primaryOrderFieldPlaceholder = primaryOrderField?.placeholder || primaryOrderFieldLabel || copy.userIdPlaceholder;
  const orderFieldKeySet = useMemo(
    () => new Set(orderFields.map((field) => String(field?.key || '').trim()).filter(Boolean)),
    [orderFields]
  );
  const hasPrimaryOrderField = orderFieldKeySet.has(primaryOrderFieldKey);
  const additionalOrderFields = useMemo(
    () => orderFields.filter((field) => String(field?.key || '').trim() !== primaryOrderFieldKey),
    [orderFields, primaryOrderFieldKey]
  );

  const validateForm = () => {
    const identifier = sanitizeOrderFieldValue(userId).trim();
    if (!quantityInput || !Number.isFinite(quantity)) return copy.emptyQuantity;
    if (quantity < quantityMeta.minQty) return copy.belowMin;
    if (quantity > quantityMeta.maxQty) return copy.aboveMax;
    if (hasPrimaryOrderField && !identifier) return copy.emptyUserId;
    for (const field of additionalOrderFields) {
      if (field?.required === false) continue;
      const key = String(field?.key || '').trim();
      if (!key) continue;
      const hasValue = isUploadFieldType(field?.type)
        ? Boolean(orderFieldFiles[key] || String(orderFieldValues[key] || '').trim())
        : Boolean(sanitizeOrderFieldValue(orderFieldValues[key]).trim());
      if (!hasValue) {
        return language === 'en'
          ? `${field.label || key} is required.`
          : `${field.label || key} مطلوب.`;
      }
    }
    if (Number.isFinite(totalPrice) && totalPrice > balance) return copy.insufficientBalance;
    if (!isPurchasable) return copy.unavailable;
    return '';
  };

  const handlePurchase = async () => {
    if (!product || !quantityMeta) return;
    const validationError = validateForm();
    setFormError(validationError);
    setServerError('');
    if (validationError) return;

    const identifier = sanitizeOrderFieldValue(userId).trim();
    setIsSubmitting(true);

    try {
      const orderId = `#${product?.name?.replace(/\s+/g, '').toUpperCase() || 'ORD'}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
      const normalizedFields = hasPrimaryOrderField ? { [primaryOrderFieldKey]: identifier } : {};

      for (const field of additionalOrderFields) {
        const key = String(field?.key || '').trim();
        if (!key) continue;

        if (isUploadFieldType(field?.type)) {
          if (orderFieldFiles[key]) {
            normalizedFields[key] = await apiClient.uploads.orderFieldImage(orderFieldFiles[key]);
          } else if (orderFieldValues[key]) {
            normalizedFields[key] = String(orderFieldValues[key]).trim();
          }
          continue;
        }

        const value = sanitizeOrderFieldValue(orderFieldValues[key]).trim();
        if (value) normalizedFields[key] = value;
      }

      if (identifier && orderFieldKeySet.has('playerId') && !normalizedFields.playerId) normalizedFields.playerId = identifier;
      if (identifier && orderFieldKeySet.has('userId') && !normalizedFields.userId) normalizedFields.userId = identifier;

      const fieldsSnapshot = Array.isArray(product?.orderFields) && product.orderFields.length > 0
        ? product.orderFields.map((field) => ({ ...field }))
        : orderFields.map((field) => ({
            key: field.key,
            label: field.label,
            placeholder: field.placeholder,
            type: field.type,
            required: field.required,
            options: field.options,
          }));

      const payload = {
        id: orderId,
        userId: user?.id,
        productId: product.id,
        productName: product.name,
        quantity,
        total: totalPrice,
        playerId: hasPrimaryOrderField ? identifier : undefined,
        customInputs: normalizedFields,
        orderFields: normalizedFields,
        orderFieldsValues: normalizedFields,
        customerInput: {
          values: normalizedFields,
          fieldsSnapshot,
          quantitySnapshot: quantityMeta,
        },
        quantitySnapshot: quantityMeta,
        timestamp: new Date().toISOString(),
        unitPriceBase,
        unitPrice,
        priceCoins: totalPrice,
        currencyCode: userCurrencyCode,
        exchangeRateAtExecution: getCurrencyMeta(userCurrencyCode, currencies).rate,
        idempotencyKey: `${user?.id || 'user'}-${product.id}-${identifier || 'fields'}-${Date.now()}`,
        preferLegacyOrderEndpoint: true,
      };

      const result = await addOrder(payload);
      const returnedOrder = result?.order || result || null;
      const returnedId = returnedOrder?.id || returnedOrder?._id || returnedOrder?.orderId || orderId;
      const returnedOrderNumber = String(
        returnedOrder?.siteOrderNumber
        || returnedOrder?.orderNumber
        || returnedOrder?.internalOrderNumber
        || returnedOrder?.displayOrderId
        || returnedId
      ).trim();
      const nextBalance = Number(result?.updatedBalance);

      if (Number.isFinite(nextBalance)) {
        const normalizedBalance = normalizeMoneyAmount(nextBalance);
        updateUserSession({ coins: normalizedBalance, walletBalance: normalizedBalance, balance: normalizedBalance });
      } else {
        const normalizedBalance = normalizeMoneyAmount(balance - totalPrice);
        updateUserSession({ coins: normalizedBalance, walletBalance: normalizedBalance, balance: normalizedBalance });
      }

      setSuccessOrder({
        orderId: returnedId,
        orderNumber: returnedOrderNumber,
        productName: product?.nameAr || product?.name,
        quantity,
        total: totalPrice,
        userId: identifier,
        status: returnedOrder?.statusLabel || returnedOrder?.status || copy.fallbackStatus,
      });
      addToast(language === 'en' ? 'Order placed successfully!' : 'تم تنفيذ الطلب بنجاح!', 'success');
    } catch (error) {
      devLogger.error('Purchase failed', error);
      setServerError(getReadableErrorMessage(
        error,
        language === 'en' ? 'Purchase failed. Please try again.' : 'فشلت عملية الشراء. حاول مرة أخرى.',
        { language }
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderNumber = async () => {
    const value = String(successOrder?.orderNumber || successOrder?.orderId || '').trim();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      addToast(copy.copied, 'success');
    } catch (_error) {
      addToast(value, 'success');
    }
  };

  const copyAccountNumber = async () => {
    if (!displayedAccountNumber) return;

    try {
      await navigator.clipboard.writeText(displayedAccountNumber);
      addToast(copy.accountCopied, 'success');
    } catch (_error) {
      addToast(displayedAccountNumber, 'success');
    }
  };

  if (!isOpen) return null;

  const displayNameAr = product?.nameAr || product?.displayName || product?.name || '';
  const displayNameEn = product?.name || product?.nameAr || '';
  const productDescription = String(
    language === 'en'
      ? (
        product?.description
        || product?.descriptionEn
        || product?.shortDescription
        || product?.details
        || product?.note
        || product?.descriptionAr
        || ''
      )
      : (
        product?.descriptionAr
        || product?.description
        || product?.shortDescriptionAr
        || product?.shortDescription
        || product?.detailsAr
        || product?.details
        || product?.noteAr
        || product?.note
        || ''
      )
  ).trim();
  const visibleError = formError || serverError;

  const renderAdditionalOrderField = (field) => {
    const key = String(field?.key || '').trim();
    if (!key) return null;
    const type = String(field?.type || 'text').trim().toLowerCase();
    const label = field?.label || key;
    const placeholder = field?.placeholder || label;

    if (type === 'select') {
      return (
        <label key={key} className="purchase-dialog-field">
          <span>{label}</span>
          <select
            value={orderFieldValues[key] || ''}
            onChange={(event) => {
              setOrderFieldValues((prev) => ({ ...prev, [key]: event.target.value }));
              setFormError('');
            }}
          >
            <option value="">{placeholder}</option>
            {(field.options || []).map((option) => (
              <option key={String(option)} value={String(option)}>{String(option)}</option>
            ))}
          </select>
        </label>
      );
    }

    if (isUploadFieldType(type)) {
      return (
        <label key={key} className="purchase-dialog-field">
          <span>{label}</span>
          <input
            type="file"
            accept="image/*"
            className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setOrderFieldFiles((prev) => ({ ...prev, [key]: file }));
              setOrderFieldValues((prev) => ({ ...prev, [key]: file ? file.name : '' }));
              setFormError('');
            }}
          />
          {orderFieldFiles[key] ? <small>{orderFieldFiles[key].name}</small> : null}
        </label>
      );
    }

    return (
      <label key={key} className="purchase-dialog-field">
        <span>{label}</span>
        <input
          type={type === 'number' ? 'number' : type === 'email' ? 'email' : 'text'}
          value={orderFieldValues[key] || ''}
          onChange={(event) => {
            setOrderFieldValues((prev) => ({ ...prev, [key]: event.target.value }));
            setFormError('');
          }}
          placeholder={placeholder}
        />
      </label>
    );
  };

  return (
    <div className="purchase-dialog-overlay" dir={dir} role="dialog" aria-modal="true">
      <button type="button" className="purchase-dialog-backdrop" onClick={onClose} aria-label={copy.cancel} />

      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="purchase-dialog-card"
      >
        <div className="purchase-dialog-grid" />
        <button type="button" className="purchase-dialog-close" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        {isLoading || !product || !quantityMeta ? (
          <div className="purchase-dialog-loading">
            <span />
            <p>{copy.loading}</p>
          </div>
        ) : successOrder ? (
          <div className="purchase-dialog-success">
            <div className="purchase-dialog-success-icon">
              <Check className="h-14 w-14" />
            </div>
            <h2>{copy.successTitle}</h2>
            <div className="purchase-dialog-summary">
              <SummaryPair
                left={{
                  label: copy.orderNumber,
                  value: successOrder.orderNumber || successOrder.orderId,
                  icon: <Copy className="h-4 w-4" />,
                  onClick: copyOrderNumber,
                  title: copy.copied,
                }}
                right={{
                  label: copy.product,
                  value: successOrder.productName,
                  icon: <Package className="h-4 w-4" />,
                }}
              />
              <SummaryPair
                left={{
                  label: copy.quantity,
                  value: formatCount(successOrder.quantity),
                  icon: <FileText className="h-4 w-4" />,
                }}
                right={{
                  label: copy.total,
                  value: formattedTotalPrice,
                  icon: <WalletCards className="h-4 w-4" />,
                }}
              />
              <SummaryPair
                left={{
                  label: copy.userId,
                  value: successOrder.userId,
                  icon: <UserRound className="h-4 w-4" />,
                }}
                right={{
                  label: copy.status,
                  value: successOrder.status,
                  icon: <Check className="h-4 w-4" />,
                }}
              />
            </div>
            <div className="purchase-dialog-success-actions">
              <button
                type="button"
                className="purchase-dialog-primary"
                onClick={() => onViewOrder?.(successOrder.orderId)}
              >
                {copy.orderDetails}
              </button>
              <button type="button" className="purchase-dialog-secondary" onClick={onClose}>
                {copy.later}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="purchase-dialog-product">
              <div className="purchase-dialog-product-visual">
                <div className="purchase-dialog-image">
                  <ProductImage product={product} />
                </div>
              </div>
              <div className="min-w-0">
                <h2>{displayNameAr}</h2>
                {displayNameEn && displayNameEn !== displayNameAr ? <p dir="ltr">{displayNameEn}</p> : null}
                <span className={isPurchasable ? 'is-available' : 'is-unavailable'}>{statusLabel}</span>
                {productDescription ? (
                  <p className="purchase-dialog-description">{productDescription}</p>
                ) : null}
              </div>
            </div>

            {displayedAccountNumber ? (
              <div className="purchase-dialog-price-card">
                <button type="button" className="purchase-dialog-copy-card" onClick={copyAccountNumber} title={copy.accountCopied}>
                  <span>{copy.accountNumber}</span>
                  <strong dir="ltr">{displayedAccountNumber}</strong>
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <label className="purchase-dialog-field">
              <span>{copy.quantity}</span>
              <input
                type="number"
                inputMode="numeric"
                min={quantityMeta.minQty}
                max={quantityMeta.maxQty}
                step={quantityMeta.stepQty}
                value={quantityInput}
                placeholder={copy.quantityPlaceholder}
                onChange={(event) => {
                  setQuantityInput(event.target.value);
                  setFormError('');
                }}
              />
              <small className="purchase-dialog-quantity-limits">
                <span>
                  {copy.minQuantity}
                  <strong dir="ltr">{formatCount(quantityMeta.minQty)}</strong>
                </span>
                <span>
                  {copy.maxQuantity}
                  <strong dir="ltr">{formatCount(quantityMeta.maxQty)}</strong>
                </span>
              </small>
            </label>

            <div className="purchase-dialog-total">
              <span>{copy.total}</span>
              <strong dir="ltr">{formattedTotalPrice}</strong>
            </div>

            {hasPrimaryOrderField ? (
              <label className="purchase-dialog-field">
                <span>{primaryOrderFieldLabel}</span>
                <input
                  type="text"
                  value={userId}
                  onChange={(event) => {
                    setUserId(event.target.value);
                    setFormError('');
                  }}
                  placeholder={primaryOrderFieldPlaceholder || copy.userIdPlaceholder}
                />
              </label>
            ) : null}

            {additionalOrderFields.map(renderAdditionalOrderField)}

            {visibleError ? <div className="purchase-dialog-error">{visibleError}</div> : null}

            <div className="purchase-dialog-actions">
              <button
                type="button"
                className="purchase-dialog-primary"
                onClick={handlePurchase}
                disabled={isSubmitting || !isPurchasable}
              >
                <LockKeyhole className="h-5 w-5" />
                {isSubmitting ? copy.buying : copy.buyNow}
              </button>
              <button type="button" className="purchase-dialog-secondary" onClick={onClose}>
                {copy.cancel}
              </button>
            </div>
          </>
        )}
      </motion.section>
    </div>
  );
};

export default ProductPurchaseDialog;
