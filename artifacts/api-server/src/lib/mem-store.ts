/**
 * In-memory data store — marché marocain (MAD).
 * Produits réels importés depuis le catalogue fournisseur.
 */

export interface ProductDetail {
  images: string[];
  longDescription: string;
  benefits: string[];
  ingredients?: string[];
  specs?: { label: string; value: string }[];
  badge?: string;
  videoUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  wholesalePrice: number;
  suggestedPrice: number;
  affiliateMargin: number;
  description: string;
  deliveryCost: number;
  inStock: boolean;
  detail?: ProductDetail;
}

export interface Order {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  city: string;
  fullAddress: string;
  salePriceAffiliate: number;
  wholesalePrice: number;
  deliveryCost: number;
  netMargin: number;
  status: string;
  deliveryNote: string | null;
  createdAt: string;
}

export interface Withdrawal {
  id: number;
  amount: number;
  status: string;
  bankName: string | null;
  ribNumber: string | null;
  requestedAt: string;
  paidAt: string | null;
}

export interface Profile {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  brandName: string;
  bankName: string | null;
  ribNumber: string | null;
  paymentMethod: string | null;
}

// ---------------------------------------------------------------------------
// New entity interfaces
// ---------------------------------------------------------------------------
export interface Category {
  id: number; key: string; labelFr: string; labelAr: string; icon: string; active: boolean;
}
export interface SupplierProduct {
  productName: string; category: string; unitPrice: number; minOrder: number;
}
export interface Supplier {
  id: number; name: string; phone: string; email: string; address: string;
  city: string; category: string; notes: string; products: SupplierProduct[];
  active: boolean; createdAt: string;
}
export interface DeliveryAgency {
  id: number; name: string; phone: string; email: string; wilayasCovered: string[];
  pricePerKg: number; deliveryDelay: string; trackingUrl: string; notes: string;
  active: boolean; createdAt: string;
}
export interface Affiliate {
  id: number; fullName: string; phone: string; email: string; city: string;
  brandName: string; joinedAt: string; totalOrders: number; totalDelivered: number;
  totalEarned: number; status: "active" | "blocked" | "pending";
  bankName: string | null; ribNumber: string | null;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const img = (name: string) => `/products/${name}`;
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}

// ---------------------------------------------------------------------------
// Seed products — catalogue réel fournisseur (prix en DH)
// ---------------------------------------------------------------------------
const seedProducts: Product[] = [
  {
    id: 1, name: "طقم مشدات رياضية Wlinsq — 8 قطع", category: "sports",
    imageUrl: img("photo_3342@21-07-2026_19-58-03.jpg"),
    wholesalePrice: 65, suggestedPrice: 160, affiliateMargin: 65, deliveryCost: 30,
    description: "طقم مشدات رياضية مكون من 8 قطع بتصميم رمادي مرن، يحمي المفاصل أثناء التدريب ويمنح دعماً مثالياً.",
    inStock: true,
    detail: {
      badge: "🏋️ رياضة",
      images: [
        img("photo_3342@21-07-2026_19-58-03.jpg"),
        img("photo_3343@21-07-2026_19-58-19.jpg"),
        img("photo_3344@21-07-2026_19-58-35.jpg"),
        img("photo_3345@21-07-2026_19-59-21.jpg"),
      ],
      longDescription: "طقم مشدات رياضية Wlinsq المكوّن من 8 قطع — تصميم رمادي أنيق ومريح، مصنوع من قماش مرن عالي الجودة. يوفر دعماً محكماً للمفاصل (الركبة، الرسغ، الكاحل، الكوع) أثناء جميع أنواع التمارين. مثالي للرياضيين والمبتدئين على حد سواء.",
      benefits: [
        "حماية كاملة للمفاصل أثناء التدريب",
        "قماش مرن ومسامي لا يسبب التعرق",
        "8 قطع تغطي جميع المفاصل الأساسية",
        "تصميم مريح يثبت في مكانه دون انزلاق",
        "مناسب لجميع الرياضات — كروس فيت، ملاكمة، جري",
        "سهل الغسيل والتنظيف",
      ],
      specs: [
        { label: "المحتوى", value: "8 قطع (ركبتان + رسغان + كاحلان + كوعان)" },
        { label: "المقاس", value: "قياس موحد قابل للضبط" },
        { label: "المادة", value: "نيوبرين + سيليكون مضاد للانزلاق" },
        { label: "اللون", value: "رمادي" },
      ],
    },
  },
  {
    id: 2, name: "جهاز تنقية مياه معدنية سطحية", category: "home",
    imageUrl: img("photo_3346@21-07-2026_20-45-55.jpg"),
    wholesalePrice: 210, suggestedPrice: 450, affiliateMargin: 170, deliveryCost: 35,
    description: "جهاز تنقية مياه منزلي بتصميم ستانلس ستيل ونظام فلترة مزدوج يزيل الكلور والشوائب.",
    inStock: true,
    detail: {
      badge: "💧 صحة",
      images: [
        img("photo_3346@21-07-2026_20-45-55.jpg"),
      ],
      longDescription: "جهاز تنقية المياه المعدنية السطحية للاستخدام المنزلي — يتميز بتصميم ستانلس ستيل أنيق ومتين، ومزود بنظام فلترة مزدوج يعمل على إزالة الكلور والشوائب والجسيمات الضارة من مياه الصنبور. سهل التركيب ولا يحتاج إلى كهرباء.",
      benefits: [
        "نظام فلترة مزدوج — يزيل الكلور والشوائب",
        "تصميم ستانلس ستيل — مقاوم للصدأ وطويل الأمد",
        "لا يحتاج إلى كهرباء",
        "مياه نقية وصحية في أي وقت",
        "سهل التركيب على الحنفية مباشرة",
      ],
      specs: [
        { label: "المادة", value: "ستانلس ستيل 304" },
        { label: "نوع الفلتر", value: "مزدوج (كربون + سيراميك)" },
        { label: "الطاقة", value: "لا تحتاج كهرباء" },
        { label: "السعر", value: "210 DH" },
      ],
    },
  },
  {
    id: 3, name: "بطاقات ذاكرة تعليمية للأطفال — 224 كلمة", category: "kids",
    imageUrl: img("photo_3351@22-07-2026_16-09-44.jpg"),
    wholesalePrice: 50, suggestedPrice: 120, affiliateMargin: 45, deliveryCost: 25,
    description: "لعبة بطاقات ذاكرة مونتيسوري للأطفال من 2 إلى 6 سنوات، تعلم 224 كلمة بطريقة تفاعلية وممتعة.",
    inStock: true,
    detail: {
      badge: "🎓 تعليمي",
      images: [
        img("photo_3351@22-07-2026_16-09-44.jpg"),
        img("photo_3347@22-07-2026_14-51-21.jpg"),
        img("photo_3348@22-07-2026_14-51-40.jpg"),
        img("photo_3349@22-07-2026_15-23-48.jpg"),
        img("photo_3350@22-07-2026_15-24-08.jpg"),
      ],
      longDescription: "لعبة بطاقات الذاكرة التعليمية للأطفال — جهاز تعلم يحتوي على 224 كلمة للأطفال الصغار. ألعاب تعلم مونتيسوري للأولاد والبنات من عمر 2 إلى 6 سنوات. مثالية للتعلم قبل المدرسة وهدية عيد الميلاد. تنمي مهارات اللغة والذاكرة والتركيز.",
      benefits: [
        "224 بطاقة تعليمية بكلمات وصور ملوّنة",
        "تنمي مهارات اللغة والذاكرة لدى الأطفال",
        "مثالية للأطفال من عمر 2 إلى 6 سنوات",
        "تصميم متين ومقاوم للعب الشديد",
        "فكرة هدية مثالية لأعياد الميلاد",
        "تشجع على التعلم الذاتي والاستكشاف",
      ],
      specs: [
        { label: "العمر المناسب", value: "2 — 6 سنوات" },
        { label: "عدد البطاقات", value: "224 بطاقة" },
        { label: "اللغة", value: "عربي / فرنسي" },
        { label: "المادة", value: "ورق مقوى مقاوم للتمزق" },
      ],
    },
  },
  {
    id: 4, name: "سترة تنحيف Genetic Slim — 3 في 1", category: "health",
    imageUrl: img("photo_3352@23-07-2026_12-43-46.jpg"),
    wholesalePrice: 80, suggestedPrice: 220, affiliateMargin: 100, deliveryCost: 30,
    description: "سترة تنحيف ناعمة ومريحة 3 في 1 تساعد على تقليل محيط البطن بتصميم مرن عالي الجودة.",
    inStock: true,
    detail: {
      badge: "🔥 الأكثر مبيعاً",
      images: [
        img("photo_3352@23-07-2026_12-43-46.jpg"),
      ],
      longDescription: "سترة تنحيف جينيتيك سليم 3 في 1 — ناعمة ومريحة، تعمل على تقليل محيط البطن وشد الجسم بطريقة طبيعية. مصنوعة من قماش عالي الجودة مريح على الجلد. يمكن ارتداؤها طوال اليوم تحت الملابس دون أي إزعاج.",
      benefits: [
        "تشد البطن والخصر بشكل فوري",
        "3 وظائف في واحدة: تنحيف + دعم + تشكيل",
        "قماش ناعم لا يظهر تحت الملابس",
        "مريحة للارتداء طوال اليوم",
        "مناسبة لجميع المقاسات",
        "تساعد على تحسين الوضعية",
      ],
      specs: [
        { label: "المادة", value: "95% بوليستر + 5% سباندكس" },
        { label: "المقاسات", value: "S / M / L / XL / XXL" },
        { label: "الألوان", value: "أسود، بيج" },
        { label: "قابل للغسيل", value: "نعم — غسيل يدوي" },
      ],
    },
  },
  {
    id: 5, name: "سلة غسيل قابلة للطي — 135L بإطار ألومنيوم", category: "home",
    imageUrl: img("photo_3353@24-07-2026_19-31-51.jpg"),
    wholesalePrice: 110, suggestedPrice: 250, affiliateMargin: 100, deliveryCost: 35,
    description: "سلة غسيل قابلة للطي سعة 135 لتر بإطار ألومنيوم متين، 3 أقسام، متوفرة بألوان أسود ورمادي وقهوي.",
    inStock: true,
    detail: {
      badge: "🏠 منزل",
      images: [
        img("photo_3353@24-07-2026_19-31-51.jpg"),
        img("photo_3354@24-07-2026_19-33-27.jpg"),
        img("photo_3355@24-07-2026_19-33-36.jpg"),
        img("photo_3356@24-07-2026_19-34-14.jpg"),
      ],
      longDescription: "سلة غسيل قابلة للطي بسعة ضخمة 135 لتر — مقسمة إلى 3 أقسام لفرز الملابس بسهولة. إطار من الألومنيوم المتين يضمن الثبات، مع مقابض جانبية للحمل. قابلة للطي الكامل لسهولة التخزين عند عدم الاستخدام.",
      benefits: [
        "سعة 135 لتر — كافية لكل الملابس",
        "3 أقسام لفرز الملابس بذكاء",
        "إطار ألومنيوم متين يدوم طويلاً",
        "قابلة للطي الكامل — لا تأخذ مساحة",
        "مقابض جانبية قوية للحمل",
        "متوفرة بألوان: أسود، رمادي، قهوي",
      ],
      specs: [
        { label: "السعة", value: "135 لتر" },
        { label: "الأقسام", value: "3 أقسام منفصلة" },
        { label: "الإطار", value: "ألومنيوم خفيف وقوي" },
        { label: "الأبعاد", value: '26 × 24 بوصة (66 × 61 سم)' },
        { label: "الألوان", value: "أسود + رمادي + قهوي" },
      ],
    },
  },
  {
    id: 6, name: "جهاز تمليس الشعر بالبخار الاحترافي", category: "beauty",
    imageUrl: img("photo_3359@24-07-2026_19-41-24.jpg"),
    wholesalePrice: 200, suggestedPrice: 450, affiliateMargin: 180, deliveryCost: 30,
    description: "جهاز تمليس شعر احترافي بتقنية البخار للحصول على شعر ناعم ولامع في دقائق.",
    inStock: true,
    detail: {
      badge: "💄 جمال",
      images: [
        img("photo_3359@24-07-2026_19-41-24.jpg"),
        img("photo_3360@24-07-2026_19-43-43.jpg"),
        img("photo_3361@24-07-2026_19-43-49.jpg"),
      ],
      longDescription: "جهاز تمليس الشعر بالبخار الاحترافي — يجمع بين حرارة الألواح المعدنية وبخار الماء لحماية الشعر من التلف أثناء التمليس. يمنح شعراً ناعماً ولامعاً كأنك في صالون. مناسب لجميع أنواع الشعر بما فيها الشعر المجعد والخشن.",
      benefits: [
        "تقنية البخار تحمي الشعر من الحرارة المفرطة",
        "شعر ناعم ولامع كصالون التجميل",
        "درجات حرارة متعددة للتكيف مع نوع الشعر",
        "يقلل التجعد بمجرد مرور واحد",
        "يناسب جميع أنواع الشعر",
        "خزان بخار كبير — لا حاجة لإعادة الملء باستمرار",
      ],
      specs: [
        { label: "تقنية التسخين", value: "ألواح سيراميك + بخار" },
        { label: "درجة الحرارة", value: "160°C — 230°C" },
        { label: "وقت التسخين", value: "30 ثانية" },
        { label: "عرض الألواح", value: "3 سم" },
        { label: "الكابل", value: "دوراني 360°" },
      ],
    },
  },
  {
    id: 7, name: "وسادة متعددة الاستعمالات للراحة والدعم", category: "health",
    imageUrl: img("photo_3362@24-07-2026_19-54-00.jpg"),
    wholesalePrice: 50, suggestedPrice: 140, affiliateMargin: 60, deliveryCost: 25,
    description: "وسادة مريحة للدعم المثالي في عدة وضعيات — مناسبة للنوم، الجلوس، والاسترخاء.",
    inStock: true,
    detail: {
      badge: "😴 راحة",
      images: [
        img("photo_3362@24-07-2026_19-54-00.jpg"),
        img("photo_3363@24-07-2026_19-54-09.jpg"),
      ],
      longDescription: "وسادة متعددة الاستعمالات للراحة والدعم — مصممة لتوفير دعم مثالي للجسم في عدة وضعيات. تساعد على تخفيف آلام الظهر والركب والرجلين والرقبة. مريحة للنوم بين الرجلين، للجلوس والعمل على اللابتوب، وحتى لتمارين الاسترخاء واليوغا.",
      benefits: [
        "تخفف آلام الظهر والركب والرقبة",
        "مناسبة للنوم بين الرجلين",
        "مريحة للجلوس أمام اللابتوب",
        "قماش ناعم لا يسخن",
        "خفيفة وسهلة الحمل",
        "مثالية للحوامل",
      ],
      specs: [
        { label: "الحشو", value: "فوم عالي الكثافة" },
        { label: "الغطاء", value: "قطن ناعم قابل للخلع والغسيل" },
        { label: "الوزن", value: "450g" },
        { label: "الأبعاد", value: "60 × 30 × 15 سم" },
      ],
    },
  },
  {
    id: 8, name: "جهاز تدليك عميق احترافي", category: "health",
    imageUrl: img("photo_3364@24-07-2026_20-06-54.jpg"),
    wholesalePrice: 190, suggestedPrice: 420, affiliateMargin: 170, deliveryCost: 30,
    description: "جهاز تدليك عميق احترافي للعضلات يريح التوترات ويخفف الآلام بسرعة.",
    inStock: true,
    detail: {
      badge: "💪 صحة",
      images: [
        img("photo_3364@24-07-2026_20-06-54.jpg"),
        img("photo_3365@24-07-2026_20-07-00.jpg"),
      ],
      longDescription: "جهاز تدليك عميق احترافي — يعمل بتقنية الاهتزاز العالي التردد لاختراق عمق العضلات وتفكيك العقد والتوترات. مثالي بعد الرياضة أو يوم عمل طويل. خفيف الوزن وسهل الاستخدام على جميع أجزاء الجسم.",
      benefits: [
        "تدليك عميق يصل إلى طبقات العضلات",
        "يخفف الآلام والتوترات بسرعة",
        "مثالي بعد التمارين الرياضية",
        "خفيف الوزن وسهل الإمساك",
        "رؤوس استبدالية متعددة للاستخدامات المختلفة",
        "بطارية قوية تدوم ساعات",
      ],
      specs: [
        { label: "سرعات الاهتزاز", value: "3 سرعات قابلة للضبط" },
        { label: "الرؤوس", value: "4 رؤوس مختلفة" },
        { label: "الضوضاء", value: "أقل من 45 ديسيبل" },
        { label: "الشحن", value: "USB-C" },
        { label: "الاستقلالية", value: "3 ساعات" },
      ],
    },
  },
  {
    id: 9, name: "ضاغط هواء ذكي للسيارة — يتوقف تلقائياً", category: "auto",
    imageUrl: img("photo_3366@24-07-2026_20-13-10.jpg"),
    wholesalePrice: 200, suggestedPrice: 450, affiliateMargin: 180, deliveryCost: 35,
    description: "ضاغط هواء ذكي للإطارات يتوقف تلقائياً عند الوصول للضغط المطلوب — آمن وموثوق.",
    inStock: true,
    detail: {
      badge: "🚗 سيارة",
      images: [
        img("photo_3366@24-07-2026_20-13-10.jpg"),
        img("photo_3367@24-07-2026_20-13-20.jpg"),
      ],
      longDescription: "ضاغط هواء ذكي للسيارة — ما عليك سوى توصيل إطار سيارتك وضبط مستوى ضغط الهواء المطلوب. تتوقف المضخة الذكية تلقائياً عند الوصول إلى القيمة المحددة، مما يمنع النفخ الزائد ويجعلها آمنة وموثوقة. مناسبة للسيارات والدراجات والمركبات.",
      benefits: [
        "توقف تلقائي عند الوصول للضغط المطلوب",
        "شاشة رقمية واضحة لقراءة الضغط",
        "مناسب لإطارات السيارات والدراجات",
        "خفيف ومدمج — يوضع في صندوق السيارة",
        "يعمل على ولاعة السيارة 12V",
        "حماية من الضغط الزائد",
      ],
      specs: [
        { label: "الضغط الأقصى", value: "150 PSI" },
        { label: "مصدر الطاقة", value: "12V — ولاعة السيارة" },
        { label: "الشاشة", value: "LCD رقمية" },
        { label: "الوحدات", value: "PSI / BAR / KPA" },
        { label: "طول الكابل", value: "3 متر" },
      ],
    },
  },
  {
    id: 10, name: "طقم تخييم قابل للطي — طاولة + 4 كراسي فراشة", category: "travel",
    imageUrl: img("photo_3368@25-07-2026_20-41-14.jpg"),
    wholesalePrice: 450, suggestedPrice: 950, affiliateMargin: 380, deliveryCost: 50,
    description: "طقم تخييم متكامل قابل للطي: طاولة مستديرة + 4 كراسي فراشة — خفيف، متين، مثالي للرحلات.",
    inStock: true,
    detail: {
      badge: "🏕️ رحلات",
      images: [
        img("photo_3368@25-07-2026_20-41-14.jpg"),
        img("photo_3369@25-07-2026_20-41-27.jpg"),
      ],
      longDescription: "طقم التخييم والرحلات القابل للطي — مكوّن من طاولة مستديرة أنيقة وأربعة كراسي فراشة خفيفة الوزن. مصمم خصيصاً لمحبي الطبيعة والتخييم. يطوى بسهولة في حقيبة حمل مخصصة. متين ويتحمل الاستخدام المكثف في الهواء الطلق.",
      benefits: [
        "طقم متكامل: طاولة + 4 كراسي",
        "قابل للطي الكامل في حقيبة حمل",
        "هيكل ألومنيوم خفيف وقوي",
        "مثالي للتخييم والشاطئ والحديقة",
        "سهل التركيب والفك في ثوانٍ",
        "يتحمل وزن حتى 120 كغ للكرسي",
      ],
      specs: [
        { label: "المحتوى", value: "طاولة مستديرة + 4 كراسي" },
        { label: "الهيكل", value: "ألومنيوم خفيف الوزن" },
        { label: "الحمولة القصوى", value: "120 كغ / كرسي" },
        { label: "الوزن الإجمالي", value: "4.5 كغ" },
        { label: "حقيبة الحمل", value: "مرفقة" },
      ],
    },
  },
  {
    id: 11, name: "طاولة تخييم ألومنيوم قابلة للطي", category: "travel",
    imageUrl: img("photo_3372@25-07-2026_20-56-44.jpg"),
    wholesalePrice: 130, suggestedPrice: 300, affiliateMargin: 120, deliveryCost: 40,
    description: "طاولة تخييم ألومنيوم قابلة للطي — حجم كبير (200 DH) وحجم صغير (130 DH)، خفيفة ومتينة.",
    inStock: true,
    detail: {
      badge: "🏕️ رحلات",
      images: [
        img("photo_3372@25-07-2026_20-56-44.jpg"),
      ],
      longDescription: "طاولة التخييم الألومنيوم القابلة للطي — تصميم عملي وخفيف الوزن مثالي للرحلات والتخييم. تطوى بسرعة وتناسب الحقيبة الصغيرة. متوفرة بحجمين: كبير وصغير. سطح مستوٍ ومتين.",
      benefits: [
        "ألومنيوم خفيف وصلب",
        "تطوى في دقيقة واحدة",
        "مثالية للتخييم والنزهات",
        "سطح مضاد للمياه",
        "أرجل قابلة للضبط",
      ],
      specs: [
        { label: "المادة", value: "ألومنيوم 6061" },
        { label: "الأحجام", value: "صغير: 60×40 سم — كبير: 80×60 سم" },
        { label: "الوزن", value: "1.2 كغ (صغير) / 2.1 كغ (كبير)" },
      ],
    },
  },
  {
    id: 12, name: "غسالة يدوية صغيرة للملابس والسباحة", category: "home",
    imageUrl: img("photo_3373@25-07-2026_21-05-30.jpg"),
    wholesalePrice: 200, suggestedPrice: 420, affiliateMargin: 170, deliveryCost: 35,
    description: "غسالة يدوية صغيرة ومدمجة لغسيل ملابس الأطفال وملابس السباحة — بدون كهرباء وبدون ماء زائد.",
    inStock: true,
    detail: {
      badge: "🧺 منزل",
      images: [
        img("photo_3373@25-07-2026_21-05-30.jpg"),
        img("photo_3374@25-07-2026_21-19-56.jpg"),
      ],
      longDescription: "الغسالة اليدوية الصغيرة — الحل السريع لغسيل ملابس الأطفال وملابس السباحة. لا تضيع الوقت ولا الماء ولا الكهرباء. مثالية للسفر والرحلات والاستخدام اليومي السريع.",
      benefits: [
        "لا تحتاج كهرباء — يدوية بالكامل",
        "توفر الماء مقارنة بالغسالة التقليدية",
        "مثالية لملابس الأطفال وملابس السباحة",
        "مدمجة وسهلة الحمل في السفر",
        "تنظيف سريع في دقائق",
      ],
      specs: [
        { label: "الطاقة", value: "يدوية — بدون كهرباء" },
        { label: "السعة", value: "3 إلى 5 قطع ملابس خفيفة" },
        { label: "الوزن", value: "850g" },
      ],
    },
  },
  {
    id: 13, name: "وسادة مقعد طبية Caresome — تخفيف ألم العصعص", category: "health",
    imageUrl: img("photo_3388@01-08-2026_20-51-06.jpg"),
    wholesalePrice: 90, suggestedPrice: 220, affiliateMargin: 90, deliveryCost: 25,
    description: "وسادة مقعد طبية عالية الكثافة لتخفيف آلام العصعص والورك وعرق النسا — تصميم خاص برغوة مريحة.",
    inStock: true,
    detail: {
      badge: "💊 صحة",
      images: [
        img("photo_3388@01-08-2026_20-51-06.jpg"),
        img("photo_3389@01-08-2026_20-51-27.jpg"),
        img("photo_3390@01-08-2026_20-51-46.jpg"),
      ],
      longDescription: "وسادة مقعد العصعص الطبية عالية الكثافة من Caresome — مصممة خصيصاً لتخفيف آلام العصعص والورك وعرق النسا. تصميم منحنٍ يوزع الوزن بشكل متساوٍ ويقلل الضغط على النقاط الحساسة. مثالية لمن يجلسون فترات طويلة.",
      benefits: [
        "تخفف آلام العصعص والورك وعرق النسا",
        "رغوة عالية الكثافة لا تتشوه بالاستخدام",
        "تصميم منحنٍ يوزع الوزن بشكل صحيح",
        "مناسبة للمكتب والسيارة والمنزل",
        "غطاء قابل للخلع والغسيل",
        "توفر راحة فورية من أول استخدام",
      ],
      specs: [
        { label: "المادة", value: "رغوة ذاكرة عالية الكثافة" },
        { label: "الأبعاد", value: "45 × 35 × 8 سم" },
        { label: "الغطاء", value: "مخمل قابل للخلع والغسيل" },
        { label: "الوزن", value: "600g" },
      ],
    },
  },
  {
    id: 14, name: "مكتب رسم تعليمي للأطفال مع جهاز عرض ذكي", category: "kids",
    imageUrl: img("photo_3393@01-08-2026_20-57-40.jpg"),
    wholesalePrice: 85, suggestedPrice: 200, affiliateMargin: 85, deliveryCost: 30,
    description: "مكتب تعلم للأطفال مع جهاز عرض ذكي، طاولة رسم موسيقية تعليمية — هدية عيد ميلاد مثالية.",
    inStock: true,
    detail: {
      badge: "🎓 تعليمي",
      images: [
        img("photo_3393@01-08-2026_20-57-40.jpg"),
        img("photo_3394@01-08-2026_20-57-58.jpg"),
      ],
      longDescription: "مكتب رسم تعليمي للأطفال مع جهاز عرض ذكي — يجمع بين المتعة والتعلم. يحتوي على سطح رسم، جهاز عرض للصور، وأصوات موسيقية. مناسب للأولاد والبنات هدية رائعة لعيد الميلاد.",
      benefits: [
        "جهاز عرض ذكي يعلم الرسم خطوة بخطوة",
        "أصوات موسيقية تشجع على التعلم",
        "يطور مهارات الرسم والإبداع",
        "مناسب لعمر 3-8 سنوات",
        "هدية عيد ميلاد مثالية",
      ],
      specs: [
        { label: "العمر المناسب", value: "3 — 8 سنوات" },
        { label: "الإضاءة", value: "LED طبيعية لا تضر العيون" },
        { label: "الطاقة", value: "بطاريات AA (مرفقة)" },
      ],
    },
  },
  {
    id: 15, name: "صندوق تلوين الأطفال — مجموعة فنية 208 قطع", category: "kids",
    imageUrl: img("photo_3395@01-08-2026_21-02-26.jpg"),
    wholesalePrice: 120, suggestedPrice: 280, affiliateMargin: 120, deliveryCost: 30,
    description: "مجموعة فنية ضخمة 208 قطع للأطفال — ألوان، أقلام، براية، ممحاة وأدوات رسم متنوعة.",
    inStock: true,
    detail: {
      badge: "🎨 أطفال",
      images: [
        img("photo_3395@01-08-2026_21-02-26.jpg"),
        img("photo_3396@01-08-2026_21-03-10.jpg"),
        img("photo_3397@01-08-2026_21-04-04.jpg"),
        img("photo_3398@01-08-2026_21-04-44.jpg"),
        img("photo_3399@01-08-2026_21-05-04.jpg"),
      ],
      longDescription: "صندوق تلوين الأطفال الضخم — مجموعة فنية شاملة تحتوي على 208 قطعة من الأقلام والألوان والأدوات الفنية. تصميم وألوان عشوائية. تنمي الإبداع والموهبة الفنية لدى الأطفال.",
      benefits: [
        "208 قطعة فنية متنوعة في صندوق واحد",
        "تشمل أقلام رصاص وألوان وفلوماستر",
        "تنمي الموهبة الفنية والإبداع",
        "مناسبة للمدرسة والاستخدام المنزلي",
        "صندوق تخزين مرتب وسهل الحمل",
      ],
      specs: [
        { label: "عدد القطع", value: "208 قطعة" },
        { label: "المحتوى", value: "أقلام رصاص + ألوان + فلوماستر + أدوات" },
        { label: "العمر المناسب", value: "5 سنوات فأكثر" },
      ],
    },
  },
  {
    id: 16, name: "كرسي تخييم خفيف قابل للطي — للهواء الطلق", category: "travel",
    imageUrl: img("photo_3400@01-08-2026_21-17-23.jpg"),
    wholesalePrice: 125, suggestedPrice: 280, affiliateMargin: 115, deliveryCost: 35,
    description: "كرسي خارجي خفيف الوزن قابل للطي للتخييم والنزهة — مريح، متين، يأتي مع حقيبة حمل.",
    inStock: true,
    detail: {
      badge: "🏕️ رحلات",
      images: [
        img("photo_3400@01-08-2026_21-17-23.jpg"),
        img("photo_3401@01-08-2026_21-17-37.jpg"),
      ],
      longDescription: "كرسي تخييم خفيف الوزن قابل للطي — بتصميم أرجوحة مريح يوفر راحة مثالية في الهواء الطلق. يحتوي على جيب خلفي كبير وحامل أكواب. يطوى بسرعة ويوضع في حقيبة الحمل. مثالي للتخييم والنزهات والفعاليات الخارجية.",
      benefits: [
        "تصميم أرجوحة مريح للغاية",
        "جيب خلفي كبير + حامل أكواب",
        "يطوى في ثوانٍ مع حقيبة حمل",
        "يتحمل وزن حتى 120 كغ",
        "مثالي للتخييم والشاطئ والحديقة",
      ],
      specs: [
        { label: "الهيكل", value: "ألومنيوم + قضبان فولاذية" },
        { label: "الحمولة القصوى", value: "120 كغ" },
        { label: "الوزن", value: "1.1 كغ" },
        { label: "الألوان", value: "متعددة — عشوائية" },
      ],
    },
  },
  {
    id: 17, name: "وسادة ساق طبية — وسادة ركبة للنائمين", category: "health",
    imageUrl: img("photo_3402@01-08-2026_21-19-59.jpg"),
    wholesalePrice: 45, suggestedPrice: 120, affiliateMargin: 50, deliveryCost: 20,
    description: "وسادة ساق طبية مريحة توضع بين الركبتين أثناء النوم لتخفيف آلام الظهر والوركين.",
    inStock: true,
    detail: {
      badge: "💊 صحة",
      images: [
        img("photo_3402@01-08-2026_21-19-59.jpg"),
        img("photo_3403@01-08-2026_21-20-15.jpg"),
      ],
      longDescription: "وسادة الساق الطبية للنائمين — توضع بين الركبتين أثناء النوم على الجانب لتصحيح وضعية العمود الفقري وتخفيف الضغط على الوركين والظهر. مثالية لمن يعانون من آلام الظهر المزمنة.",
      benefits: [
        "تصحح وضعية الجسم أثناء النوم",
        "تخفف آلام الظهر والوركين",
        "شكل مريح يثبت بين الركبتين",
        "رغوة ذاكرة لا تتشوه",
        "غطاء قابل للغسيل",
      ],
      specs: [
        { label: "الحشو", value: "رغوة ذاكرة" },
        { label: "الغطاء", value: "قطن ناعم قابل للخلع" },
        { label: "الأبعاد", value: "25 × 18 × 8 سم" },
      ],
    },
  },
  {
    id: 18, name: "حاويات تخزين الطعام — طقم متكامل", category: "kitchen",
    imageUrl: img("photo_3404@01-08-2026_21-22-19.jpg"),
    wholesalePrice: 80, suggestedPrice: 190, affiliateMargin: 80, deliveryCost: 30,
    description: "طقم حاويات تخزين الطعام الشفافة المحكمة الإغلاق — مثالية للمطبخ والثلاجة والفرن.",
    inStock: true,
    detail: {
      badge: "🍽️ مطبخ",
      images: [
        img("photo_3404@01-08-2026_21-22-19.jpg"),
      ],
      longDescription: "طقم حاويات تخزين الطعام الشفافة — مصنوعة من بلاستيك آمن مقاوم للحرارة. أغطية محكمة الإغلاق تحافظ على طزاجة الطعام لفترة أطول. متوافقة مع الثلاجة والميكروويف وغسالة الأطباق.",
      benefits: [
        "أغطية محكمة الإغلاق تمنع تسرب الهواء",
        "شفافة — ترى محتوياتها بسهولة",
        "مقاومة للحرارة والتجميد",
        "متوافقة مع الميكروويف والثلاجة",
        "قابلة للغسيل في ماكينة الأطباق",
        "متعددة الأحجام في طقم واحد",
      ],
      specs: [
        { label: "المادة", value: "BPA-Free بلاستيك" },
        { label: "الأحجام", value: "مجموعة متنوعة" },
        { label: "مقاومة الحرارة", value: "حتى 120°C" },
      ],
    },
  },
  {
    id: 19, name: "مكنسة كهربائية Fizler 4 في 1 — 3500W", category: "home",
    imageUrl: img("photo_3418@01-08-2026_22-28-01.jpg"),
    wholesalePrice: 220, suggestedPrice: 480, affiliateMargin: 200, deliveryCost: 40,
    description: "مكنسة كهربائية Fizler Handy & Stick 4 في 1 بقوة 3500W — تنظيف شامل للمنزل.",
    inStock: true,
    detail: {
      badge: "🏠 منزل",
      images: [
        img("photo_3418@01-08-2026_22-28-01.jpg"),
        img("photo_3419@01-08-2026_22-28-40.jpg"),
        img("photo_3420@01-08-2026_22-29-14.jpg"),
      ],
      longDescription: "مكنسة كهربائية Fizler طراز Handy & Stick 4 في 1 بقوة شفط هائلة 3500W. تتحول من مكنسة عصا إلى مكنسة يدوية في ثوانٍ. مثالية لتنظيف الأرضيات والسجاد والزوايا الضيقة.",
      benefits: [
        "4 في 1: عصا + يدوية + مكيف + أرضيات",
        "قوة شفط 3500W لتنظيف عميق",
        "خفيفة ومرنة — سهلة الوصول للزوايا",
        "فلتر HEPA يحبس الغبار والحساسية",
        "بطارية قابلة للشحن — بدون كابل",
        "سهلة الفك والتنظيف",
      ],
      specs: [
        { label: "القوة", value: "3500W" },
        { label: "الأوضاع", value: "4 في 1" },
        { label: "الفلتر", value: "HEPA" },
        { label: "الشحن", value: "USB-C / محطة شحن" },
        { label: "الاستقلالية", value: "45 دقيقة" },
      ],
    },
  },
  {
    id: 20, name: "خزانة تخزين محمولة متعددة الوظائف", category: "home",
    imageUrl: img("photo_3424@04-08-2026_20-43-24.jpg"),
    wholesalePrice: 230, suggestedPrice: 520, affiliateMargin: 230, deliveryCost: 45,
    description: "خزانة تخزين محمولة تشمل: خزانة ملابس + أدراج شفافة + وحدة تخزين أحذية — سهلة التركيب.",
    inStock: true,
    detail: {
      badge: "🏠 تنظيم",
      images: [
        img("photo_3424@04-08-2026_20-43-24.jpg"),
        img("photo_3425@04-08-2026_20-55-26.jpg"),
      ],
      longDescription: "خزانة تخزين محمولة متعددة الوظائف — الحل المثالي لتنظيم بيتك. تشمل مساحة لتعليق الملابس، أدراج شفافة للإكسسوارات، ووحدة مخصصة للأحذية. هيكل قوي سهل التركيب، مناسب لكل زاوية في المنزل.",
      benefits: [
        "خزانة ملابس محمولة مع عارضة تعليق",
        "أدراج شفافة لسهولة الوصول",
        "وحدة تخزين أحذية منظمة",
        "تركيب سريع بدون أدوات",
        "هيكل قوي يدوم طويلاً",
        "توفر المساحة وتنظم الغرفة",
      ],
      specs: [
        { label: "الهيكل", value: "أنابيب فولاذية مطلية بالكروم" },
        { label: "الأبعاد", value: "قابلة للضبط حسب المساحة" },
        { label: "التركيب", value: "سهل بدون أدوات" },
        { label: "الحمولة القصوى", value: "30 كغ على العارضة" },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Seed orders — basés sur les vrais produits
// ---------------------------------------------------------------------------
const seedOrders: Order[] = [
  { id: 1, productId: 1, productName: "طقم مشدات رياضية Wlinsq", productImage: img("photo_3342@21-07-2026_19-58-03.jpg"), customerFirstName: "أمينة", customerLastName: "بنعلي", customerPhone: "0661234567", city: "الدار البيضاء", fullAddress: "شارع محمد الخامس رقم 12", salePriceAffiliate: 160, wholesalePrice: 65, deliveryCost: 30, netMargin: 65, status: "LIVREE", deliveryNote: null, createdAt: daysAgo(20) },
  { id: 2, productId: 6, productName: "جهاز تمليس الشعر بالبخار", productImage: img("photo_3359@24-07-2026_19-41-24.jpg"), customerFirstName: "نادية", customerLastName: "الصديق", customerPhone: "0770987654", city: "الرباط", fullAddress: "حي السفير", salePriceAffiliate: 450, wholesalePrice: 200, deliveryCost: 30, netMargin: 220, status: "LIVREE", deliveryNote: null, createdAt: daysAgo(18) },
  { id: 3, productId: 9, productName: "ضاغط هواء ذكي للسيارة", productImage: img("photo_3366@24-07-2026_20-13-10.jpg"), customerFirstName: "كريم", customerLastName: "الحسيني", customerPhone: "0551122334", city: "فاس", fullAddress: "المدينة القديمة", salePriceAffiliate: 450, wholesalePrice: 200, deliveryCost: 35, netMargin: 215, status: "LIVREE", deliveryNote: null, createdAt: daysAgo(15) },
  { id: 4, productId: 4, productName: "سترة تنحيف Genetic Slim", productImage: img("photo_3352@23-07-2026_12-43-46.jpg"), customerFirstName: "فاطمة", customerLastName: "الزهراء", customerPhone: "0662233445", city: "مراكش", fullAddress: "حي جليز", salePriceAffiliate: 220, wholesalePrice: 80, deliveryCost: 30, netMargin: 110, status: "EN_COURS_LIVRAISON", deliveryNote: "الاتصال قبل التوصيل", createdAt: daysAgo(5) },
  { id: 5, productId: 13, productName: "وسادة مقعد طبية Caresome", productImage: img("photo_3388@01-08-2026_20-51-06.jpg"), customerFirstName: "يوسف", customerLastName: "بنشريف", customerPhone: "0779876543", city: "طنجة", fullAddress: "شارع إبن بطوطة", salePriceAffiliate: 220, wholesalePrice: 90, deliveryCost: 25, netMargin: 105, status: "LIVREE", deliveryNote: null, createdAt: daysAgo(12) },
  { id: 6, productId: 19, productName: "مكنسة كهربائية Fizler 4 في 1", productImage: img("photo_3418@01-08-2026_22-28-01.jpg"), customerFirstName: "سارة", customerLastName: "بوعزة", customerPhone: "0553344556", city: "أكادير", fullAddress: "حي الحسين", salePriceAffiliate: 480, wholesalePrice: 220, deliveryCost: 40, netMargin: 220, status: "RETOURNEE", deliveryNote: "العميل غائب", createdAt: daysAgo(10) },
  { id: 7, productId: 10, productName: "طقم تخييم قابل للطي", productImage: img("photo_3368@25-07-2026_20-41-14.jpg"), customerFirstName: "حمزة", customerLastName: "التازي", customerPhone: "0664455667", city: "وجدة", fullAddress: "شارع إدريس الأول", salePriceAffiliate: 950, wholesalePrice: 450, deliveryCost: 50, netMargin: 450, status: "LIVREE", deliveryNote: null, createdAt: daysAgo(8) },
  { id: 8, productId: 3, productName: "بطاقات ذاكرة تعليمية", productImage: img("photo_3351@22-07-2026_16-09-44.jpg"), customerFirstName: "لميا", customerLastName: "الإدريسي", customerPhone: "0775566778", city: "مكناس", fullAddress: "حي ورزازات", salePriceAffiliate: 120, wholesalePrice: 50, deliveryCost: 25, netMargin: 45, status: "CONFIRMEE", deliveryNote: null, createdAt: daysAgo(3) },
  { id: 9, productId: 7, productName: "وسادة متعددة الاستعمالات", productImage: img("photo_3362@24-07-2026_19-54-00.jpg"), customerFirstName: "ياسين", customerLastName: "العلوي", customerPhone: "0556677889", city: "الجديدة", fullAddress: "حي الورود", salePriceAffiliate: 140, wholesalePrice: 50, deliveryCost: 25, netMargin: 65, status: "LIVREE", deliveryNote: null, createdAt: daysAgo(6) },
  { id: 10, productId: 20, productName: "خزانة تخزين محمولة", productImage: img("photo_3424@04-08-2026_20-43-24.jpg"), customerFirstName: "مريم", customerLastName: "بن موسى", customerPhone: "0667788990", city: "الدار البيضاء", fullAddress: "درب السلطان", salePriceAffiliate: 520, wholesalePrice: 230, deliveryCost: 45, netMargin: 245, status: "NOUVELLE", deliveryNote: null, createdAt: daysAgo(1) },
];

const seedWithdrawals: Withdrawal[] = [
  { id: 1, amount: 1500, status: "PAYE", bankName: "CIH Bank", ribNumber: "230810001234567890", requestedAt: daysAgo(30), paidAt: daysAgo(28) },
  { id: 2, amount: 900, status: "EN_TRAITEMENT", bankName: "Banque Populaire", ribNumber: "101510009876543210", requestedAt: daysAgo(7), paidAt: null },
];

const seedProfile: Profile = {
  id: 1, fullName: "Mohamed Elarabi", phone: "0661234567",
  email: "contact@digitalecomland.ma", city: "الدار البيضاء", brandName: "Digital Ecom Land",
  bankName: "CIH Bank", ribNumber: "230810001234567890", paymentMethod: "virement",
};

// ---------------------------------------------------------------------------
// Seed categories
// ---------------------------------------------------------------------------
const seedCategories: Category[] = [
  { id: 1,  key: "health",     labelFr: "Santé & Bien-être",       labelAr: "صحة وعافية",          icon: "💊", active: true },
  { id: 2,  key: "sports",     labelFr: "Sport & Fitness",         labelAr: "رياضة ولياقة",         icon: "⚽", active: true },
  { id: 3,  key: "beauty",     labelFr: "Beauté & Cosmétiques",    labelAr: "تجميل وعناية بالبشرة", icon: "💄", active: true },
  { id: 4,  key: "home",       labelFr: "Maison & Déco",           labelAr: "منزل وديكور",          icon: "🏠", active: true },
  { id: 5,  key: "kitchen",    labelFr: "Cuisine & Ustensiles",    labelAr: "مطبخ وأدوات منزلية",  icon: "🍳", active: true },
  { id: 6,  key: "kids",       labelFr: "Bébé & Enfants",          labelAr: "منتجات الأطفال",       icon: "🍼", active: true },
  { id: 7,  key: "travel",     labelFr: "Voyage & Outdoor",        labelAr: "سفر وتخييم",           icon: "🏕️", active: true },
  { id: 8,  key: "auto",       labelFr: "Auto & Accessoires",      labelAr: "سيارات وإكسسوارات",   icon: "🚗", active: true },
  { id: 9,  key: "electronics",labelFr: "Électronique & Tech",     labelAr: "إلكترونيات وتقنية",   icon: "📱", active: true },
];

// ---------------------------------------------------------------------------
// Seed supplier — fournisseur Taj (sans coordonnées privées)
// ---------------------------------------------------------------------------
const seedSuppliers: Supplier[] = [
  {
    id: 1,
    name: "موردنا الرئيسي — قناة تاج",
    phone: "", email: "", address: "المغرب", city: "المغرب",
    category: "multi",
    notes: "مورد متعدد الفئات: رياضة، منزل، صحة، أطفال، رحلات. الأسعار بالجملة تنخفض مع زيادة الكمية.",
    products: seedProducts.map(p => ({
      productName: p.name,
      category: p.category,
      unitPrice: p.wholesalePrice,
      minOrder: 1,
    })),
    active: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Seed delivery agencies — Maroc
// ---------------------------------------------------------------------------
const seedDeliveryAgencies: DeliveryAgency[] = [
  {
    id: 1, name: "Amana Maroc", phone: "0522-XX-XX-XX", email: "pro@amana.ma",
    wilayasCovered: ["الدار البيضاء", "الرباط", "فاس", "مراكش", "طنجة", "أكادير", "مكناس", "وجدة"],
    pricePerKg: 25, deliveryDelay: "24-48h", trackingUrl: "https://amana.ma/tracking",
    notes: "شريك رئيسي — تغطية وطنية ممتازة. تتبع لحظي للطرود.",
    active: true, createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 2, name: "Chronopost Maroc", phone: "0800-200-888", email: "b2b@chronopost.ma",
    wilayasCovered: ["جميع المدن المغربية"],
    pricePerKg: 30, deliveryDelay: "24h", trackingUrl: "https://chronopost.ma/suivi",
    notes: "أسرع خدمة في المغرب. مناسبة للطلبات المستعجلة.",
    active: true, createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 3, name: "CTM Messagerie", phone: "0522-XX-XX-XX", email: "messagerie@ctm.ma",
    wilayasCovered: ["جميع المدن المغربية"],
    pricePerKg: 20, deliveryDelay: "48-72h", trackingUrl: "https://ctm.ma/tracking",
    notes: "الأرخص سعراً. مناسبة للمناطق النائية.",
    active: false, createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Seed affiliates — profils marocains
// ---------------------------------------------------------------------------
const seedAffiliates: Affiliate[] = [
  {
    id: 1, fullName: "أمينة بنعلي", phone: "0661234567", email: "amina.b@gmail.com",
    city: "الدار البيضاء", brandName: "Amina Shop MA",
    joinedAt: new Date(Date.now() - 80 * 86400000).toISOString(),
    totalOrders: 45, totalDelivered: 38, totalEarned: 8500, status: "active",
    bankName: "CIH Bank", ribNumber: "230810001234567890",
  },
  {
    id: 2, fullName: "كريم الحسيني", phone: "0770987654", email: "karim.h@outlook.com",
    city: "الرباط", brandName: "K-Deals MA",
    joinedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    totalOrders: 30, totalDelivered: 22, totalEarned: 5600, status: "active",
    bankName: "Banque Populaire", ribNumber: "101510009876543210",
  },
  {
    id: 3, fullName: "فاطمة الزهراء", phone: "0551122334", email: "fatima.z@gmail.com",
    city: "فاس", brandName: "Fatima Store",
    joinedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    totalOrders: 18, totalDelivered: 14, totalEarned: 3200, status: "active",
    bankName: null, ribNumber: null,
  },
  {
    id: 4, fullName: "يوسف بنشريف", phone: "0556677889", email: "youssef.b@gmail.com",
    city: "مراكش", brandName: "YB Maroc",
    joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    totalOrders: 5, totalDelivered: 3, totalEarned: 620, status: "pending",
    bankName: null, ribNumber: null,
  },
  {
    id: 5, fullName: "نادية الصديق", phone: "0779876543", email: "nadia.s@gmail.com",
    city: "أكادير", brandName: "Nadia Shop MA",
    joinedAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    totalOrders: 12, totalDelivered: 8, totalEarned: 1800, status: "blocked",
    bankName: "Attijariwafa", ribNumber: "007640001234567890",
  },
];

// ---------------------------------------------------------------------------
// Mutable store
// ---------------------------------------------------------------------------
export const store = {
  products: [...seedProducts] as Product[],
  orders: [...seedOrders] as Order[],
  withdrawals: [...seedWithdrawals] as Withdrawal[],
  profile: { ...seedProfile } as Profile,
  categories: [...seedCategories] as Category[],
  suppliers: [...seedSuppliers] as Supplier[],
  deliveryAgencies: [...seedDeliveryAgencies] as DeliveryAgency[],
  affiliates: [...seedAffiliates] as Affiliate[],
  _nextId: {
    products: seedProducts.length + 1,
    orders: seedOrders.length + 1,
    withdrawals: seedWithdrawals.length + 1,
    categories: seedCategories.length + 1,
    suppliers: seedSuppliers.length + 1,
    deliveryAgencies: seedDeliveryAgencies.length + 1,
    affiliates: seedAffiliates.length + 1,
  },
};
