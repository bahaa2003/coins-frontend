import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  Database,
  FileJson2,
  Globe2,
  KeyRound,
  ListChecks,
  Server,
  ShieldAlert,
  TableProperties,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import useAuthStore from '../store/useAuthStore';
import apiClient from '../services/client'; 

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';
const API_BASE_URL = (
  import.meta.env.VITE_API_URL
  || import.meta.env.VITE_API_BASE_URL
  || `${BASE_URL}/api`
).replace(/\/+$/, '');

const endpointUrl = (path) => `${API_BASE_URL}${path}`;

const copyText = async (value) => {
  const text = String(value || '');
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
};

// --- Mock JSON Responses ---

const balanceResponse = `{
  "success": true,
  "data": {
    "balance": 245.75,
    "walletBalance": 245.75,
    "creditLimit": 0,
    "creditUsed": 0,
    "currency": "USD"
  }
}`;

const productsResponse = `{
  "success": true,
  "data": [
    {
      "id": "65f1a1c8e9a5b2a1c9d12001",
      "name": "PUBG Mobile UC 60",
      "price": 1.5,
      "minQty": 1,
      "maxQty": 50,
      "currency": "USD",
      "fields": [
        {
          "key": "playerId",
          "label": "Player ID",
          "required": true,
          "type": "text"
        }
      ]
    }
  ]
}`;

const orderRequest = `{
  "productId": "65f1a1c8e9a5b2a1c9d12001",
  "quantity": 1,
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "playerId": "123456789"
}`;

const orderSuccessResponse = `{
  "success": true,
  "data": {
    "orderId": "66a88f8c4b40f4a9f0d41010",
    "orderNumber": "ORD-12345",
    "status": "PENDING",
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
    "idempotent": false
  }
}`;

const orderFailureResponse = `{
  "success": false,
  "code": "RESELLER_INSUFFICIENT_BALANCE",
  "message": "Insufficient balance"
}`;

const checkOrdersResponse = `{
  "success": true,
  "data": {
    "orderId": "66a88f8c4b40f4a9f0d41010",
    "orderNumber": "ORD-12345",
    "productId": "65f1a1c8e9a5b2a1c9d12001",
    "productName": "PUBG Mobile UC 60",
    "quantity": 1,
    "status": "COMPLETED",
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
  }
}`;

const errorCodes = [
  { code: 400, ar: 'بيانات غير مكتملة أو خاطئة', en: 'Bad Request / Validation Error' },
  { code: 401, ar: 'توكن الـ API مفقود أو غير صالح', en: 'Unauthorized / Invalid Token' },
  { code: 403, ar: 'عنوان IP غير مصرح به', en: 'Forbidden IP' },
  { code: 404, ar: 'الطلب أو المنتج غير موجود', en: 'Not Found' },
];

const parameters = [
  {
    name: 'productId',
    required: 'Required',
    type: 'String',
    description: 'معرف المنتج الذي تم الحصول عليه من مسار المنتجات.',
  },
  {
    name: 'quantity',
    required: 'Required',
    type: 'Number',
    description: 'الكمية المطلوبة. يجب أن تكون بين minQty و maxQty.',
  },
  {
    name: 'idempotencyKey',
    required: 'Required',
    type: 'String',
    description: 'مفتاح فريد يرسله العميل لمنع تكرار الطلب أو الخصم المزدوج عند إعادة المحاولة.',
  },
  {
    name: 'playerId',
    required: 'Dynamic',
    type: 'String',
    description: 'حقل ديناميكي حسب متطلبات المنتج (تجد الحقول المطلوبة في مسار المنتجات).',
  },
];

// --- UI Components ---

const CodeBlock = ({ children }) => (
  <pre className="overflow-x-auto rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-elevated-rgb)/0.74)] p-4 text-left text-xs leading-6 text-[var(--color-text)] shadow-[var(--shadow-subtle)] [direction:ltr]">
    <code>{children}</code>
  </pre>
);

const Section = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.86)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-5 shadow-[var(--shadow-subtle)]">
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);

const EndpointCard = ({ method, path, title, description, children }) => (
  <article className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="rounded-md border border-[color:rgb(var(--color-primary-rgb)/0.35)] bg-[color:rgb(var(--color-primary-rgb)/0.1)] px-2 py-1 font-mono text-xs font-bold text-[var(--color-primary)] [direction:ltr]">
        {method}
      </span>
      <span className="font-mono text-sm text-[var(--color-text)] [direction:ltr]">{path}</span>
    </div>
    <h3 className="text-base font-bold text-[var(--color-text)]">{title}</h3>
    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
    <div className="mt-3 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-elevated-rgb)/0.42)] p-3">
      <p className="mb-2 text-xs font-semibold text-[var(--color-text-secondary)]">الرابط الكامل</p>
      <CodeBlock>{endpointUrl(path)}</CodeBlock>
    </div>
    {children ? <div className="mt-4 space-y-3">{children}</div> : null}
  </article>
);

const ParameterTable = () => (
  <div className="overflow-x-auto rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)]">
    <div className="min-w-[720px]">
      <div className="grid grid-cols-[1fr_92px_90px_2fr] bg-[color:rgb(var(--color-elevated-rgb)/0.72)] text-xs font-bold text-[var(--color-text)]">
        <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">المعامل</div>
        <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">الحالة</div>
        <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">النوع</div>
        <div className="p-3">الوصف</div>
      </div>
      {parameters.map((param) => (
        <div key={param.name} className="grid grid-cols-[1fr_92px_90px_2fr] border-t border-[color:rgb(var(--color-border-rgb)/0.72)] text-xs text-[var(--color-text-secondary)]">
          <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3 font-mono text-[var(--color-text)] [direction:ltr]">{param.name}</div>
          <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">{param.required}</div>
          <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">{param.type}</div>
          <div className="p-3 leading-6">{param.description}</div>
        </div>
      ))}
    </div>
  </div>
);

// --- Token Generation Component ---
const TokenGeneratorCard = () => {
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawToken, setRawToken] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await apiClient.me.generateApiToken();
      setRawToken(res.rawToken || res.data?.rawToken || '');
      addToast('تم إنشاء توكن جديد بنجاح.', 'success');
    } catch (error) {
      addToast(error?.message || 'تعذر إنشاء التوكن.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!rawToken) {
      addToast('لا يوجد توكن لنسخه، قم بتوليد توكن أولاً', 'error');
      return;
    }
    const copied = await copyText(rawToken);
    addToast(copied ? 'تم النسخ بنجاح' : 'فشل النسخ', copied ? 'success' : 'error');
  };

  return (
    <div className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.86)] bg-[color:rgb(var(--color-card-rgb)/0.5)] p-5 shadow-[var(--shadow-subtle)]">
      {/* Header Row */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-text)]">
            <KeyRound className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold">الوصول عبر API</h2>
          </div>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            استخدم هذا التوكن لتوثيق طلباتك مع واجهة الموزعين.
          </p>
        </div>
        {user?.isApiEnabled && (
          <span className="inline-flex h-7 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-500">
            مفعل
          </span>
        )}
      </div>

      {/* Warning Banner (دائما ظاهر زي الصورة) */}
      <div className="mb-5 flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-500">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          يرجى نسخ التوكن وحفظه في مكان آمن. لن يتم عرض هذا التوكن مرة أخرى عند تحديث الصفحة لدواعي أمنية. إذا فقدته، قم بتوليد توكن جديد.
        </p>
      </div>

      {/* Input & Buttons Row */}
      <div>
        <p className="mb-2 text-xs font-bold text-[var(--color-text-secondary)]">توكن الوصول</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          
          {/* Input Area (بدون عين ولا نقط) */}
          <div className="flex flex-1 items-center rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.8)] bg-[color:rgb(var(--color-elevated-rgb)/0.5)] px-4 py-2.5">
            <input
              type="text"
              readOnly
              value={rawToken || 'التوكن مخفي لدواعي أمنية. قم بتوليد توكن جديد إذا كنت تحتاج نسخة منه.'}
              className="w-full bg-transparent text-sm font-mono outline-none"
              style={{
                direction: rawToken ? 'ltr' : 'rtl',
                textAlign: rawToken ? 'left' : 'right',
                color: rawToken ? 'var(--color-text)' : 'var(--color-text-secondary)'
              }}
            />
          </div>

          {/* Actions (نسخ ثم توليد) */}
          <div className="flex shrink-0 gap-3">
            <Button type="button" variant="outline" onClick={handleCopy} disabled={!rawToken}>
              <ClipboardCopy className="h-4 w-4" />
              نسخ
            </Button>
            <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              إعادة توليد التوكن
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const DeveloperApi = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const docsPlainText = useMemo(
    () => `دليل API للموزعين - B2B Reseller API
========================================

1) الروابط
----------------------
API Base URL:
${API_BASE_URL}/v1/reseller

ملاحظة:
كل المسارات التالية تضاف إلى API Base URL. مثال:
${endpointUrl('/v1/reseller/balance')}

2) التوثيق Authentication
-------------------------
يجب إرسال توكن الـ API في HTTP Headers مع كل طلب:

x-api-key: YOUR_TOKEN

3) Check Balance - الاستعلام عن الرصيد
-------------------------------
GET /v1/reseller/balance
Full URL: ${endpointUrl('/v1/reseller/balance')}

Success JSON Response:
${balanceResponse}

4) Products - جلب المنتجات
-----------------------------------
GET /v1/reseller/products
Full URL: ${endpointUrl('/v1/reseller/products')}

Success JSON Response:
${productsResponse}

5) Place Order - إنشاء طلب
--------------------------
POST /v1/reseller/orders
Full URL: ${endpointUrl('/v1/reseller/orders')}

Headers:
x-api-key: YOUR_TOKEN
Content-Type: application/json

Request Body Example:
${orderRequest}

Success JSON Response:
${orderSuccessResponse}

6) Check Orders - متابعة الطلبات
--------------------------------
GET /v1/reseller/orders/:idempotencyKey
Full URL: ${endpointUrl('/v1/reseller/orders/550e8400-e29b-41d4-a716-446655440000')}

Success JSON Response:
${checkOrdersResponse}
`,
    []
  );

  const handleCopyDocs = async () => {
    try {
      const copied = await copyText(docsPlainText);
      addToast(copied ? 'تم نسخ الدليل الكامل للمبرمج.' : 'تعذر نسخ الدليل.', copied ? 'success' : 'error');
    } catch {
      addToast('تعذر نسخ الدليل.', 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'الروابط والتوثيق', icon: Globe2 },
    { id: 'endpoints', label: 'المسارات والأمثلة', icon: ListChecks },
    { id: 'errors', label: 'أكواد الأخطاء', icon: ShieldAlert },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-16 sm:px-6 lg:px-8">
      
      {/* قسم توليد التوكن اللي كان مفقود */}
      <TokenGeneratorCard />

      <Card className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] p-5 shadow-[var(--shadow-subtle)]">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text)]">
              <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
              دليل API للموزعين
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
              مرجع تكامل احترافي لحسابات B2B المصرح لها. يحتوي على الروابط الديناميكية، طريقة التوثيق،
              أمثلة JSON كاملة، قواعد منع التكرار (Idempotency)، وأكواد الأخطاء.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleCopyDocs}>
            <ClipboardCopy className="h-4 w-4" />
            نسخ الدليل للمبرمج
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border px-4 text-sm font-semibold transition ${
                  isActive
                    ? 'border-[color:rgb(var(--color-primary-rgb)/0.38)] bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]'
                    : 'border-[color:rgb(var(--color-border-rgb)/0.86)] text-[var(--color-text-secondary)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.07)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-4">
            <Section
              icon={Server}
              title="الروابط الأساسية"
              description="يتم استخدام الرابط التالي كأساس لجميع الطلبات القادمة للـ API."
            >
              <div className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <Database className="h-4 w-4 text-[var(--color-primary)]" />
                  API_BASE_URL
                </div>
                <CodeBlock>{API_BASE_URL}/v1/reseller</CodeBlock>
              </div>
            </Section>

            <Section
              icon={KeyRound}
              title="التوثيق Authentication"
              description="يجب إرسال توكن الوصول في الهيدر مع كل طلب. أي طلب بدون التوكن سيرفضه الخادم."
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)]">
                <CodeBlock>{`x-api-key: YOUR_TOKEN`}</CodeBlock>
                <div className="flex gap-3 rounded-xl border border-amber-400/40 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-300/25 dark:bg-amber-950/20 dark:text-amber-100">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>
                    احفظ التوكن في الخادم الخاص بك (Backend) أو بيئة آمنة. لا تقم بتضمينه داخل تطبيق Frontend عام.
                  </p>
                </div>
              </div>
            </Section>
          </div>
        ) : null}

        {activeTab === 'endpoints' ? (
          <div className="space-y-4">
            <EndpointCard
              method="GET"
              path="/v1/reseller/balance"
              title="Balance - الاستعلام عن الرصيد"
              description="يعيد الرصيد المتاح، الحد الائتماني، وعملة الحساب الخاصة بالموزع."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Success JSON Response
                </div>
                <CodeBlock>{balanceResponse}</CodeBlock>
              </div>
            </EndpointCard>

            <EndpointCard
              method="GET"
              path="/v1/reseller/products"
              title="Products - جلب المنتجات والأسعار"
              description="يعيد المنتجات المتاحة للـ API مع أسعار الموزع النهائية والحقول الديناميكية المطلوبة."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <FileJson2 className="h-4 w-4 text-[var(--color-primary)]" />
                  Success JSON Response
                </div>
                <CodeBlock>{productsResponse}</CodeBlock>
              </div>
            </EndpointCard>

            <EndpointCard
              method="POST"
              path="/v1/reseller/orders"
              title="Place Order - إنشاء طلب شحن"
              description="ينشئ طلبا جديدا. إرسال idempotencyKey إلزامي لمنع تكرار الطلبات والخصم المزدوج."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <TableProperties className="h-4 w-4 text-[var(--color-primary)]" />
                  Parameter Table
                </div>
                <ParameterTable />
              </div>
              <div>
                <div className="mb-2 text-sm font-bold text-[var(--color-text)]">Request Body Example</div>
                <CodeBlock>{orderRequest}</CodeBlock>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Success JSON Response
                  </div>
                  <CodeBlock>{orderSuccessResponse}</CodeBlock>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    Failure JSON Response
                  </div>
                  <CodeBlock>{orderFailureResponse}</CodeBlock>
                </div>
              </div>
            </EndpointCard>

            <EndpointCard
              method="GET"
              path="/v1/reseller/orders/:idempotencyKey"
              title="Check Orders - متابعة حالة الطلب"
              description="مرر الـ idempotencyKey كجزء من الرابط للتحقق من حالة الطلب الخاص بك."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Success JSON Response
                </div>
                <CodeBlock>{checkOrdersResponse}</CodeBlock>
              </div>
            </EndpointCard>
          </div>
        ) : null}

        {activeTab === 'errors' ? (
          <Section
            icon={ShieldAlert}
            title="Error Codes Directory"
            description="أكواد الأخطاء المعتمدة التي قد تظهر عند فشل الطلب."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {errorCodes.map((item) => (
                <div key={item.code} className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-surface-rgb)/0.52)] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-lg border border-red-400/30 bg-red-500/10 px-2 py-1 font-mono text-xs font-bold text-red-500">
                      {item.code}
                    </span>
                    <h3 className="font-bold text-[var(--color-text)]">{item.ar}</h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{item.en}</p>
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </Card>
    </div>
  );
};

export default DeveloperApi;