import { PrismaClient, ProviderType, ConnectionStatus } from '@prisma/client';

const prisma = new PrismaClient();

type SeedAppInput = {
  slug: string;
  internalName: string;
  contents: Array<{
    locale: 'en' | 'tr';
    name: string;
    shortName: string;
    type: string;
    badge: string;
    description: string;
    longDescription: string;
    highlights: string[];
    screenshots: string[];
    features: string[];
    faqs: Array<{ question: string; answer: string }>;
    requirements: string[];
    terms: string[];
    steps: string[];
    scores: Array<{ label: string; value: number }>;
    screenGradient: string;
    glowClass: string;
    dark: boolean;
  }>;
  metrics: {
    apple: {
      rating: number;
      reviewCount: number;
      downloadEstimate: string;
      versionLabel: string;
      releaseStatus: string;
    };
    google: {
      rating: number;
      reviewCount: number;
      downloadEstimate: string;
      versionLabel: string;
      releaseStatus: string;
    };
  };
  reviews: Array<{
    provider: ProviderType;
    storeReviewId: string;
    locale: string;
    rating: number;
    title: string;
    body: string;
    authorName: string;
    reviewCreatedAt: string;
  }>;
  analytics: Array<{
    locale: string;
    parentsReached: number;
    repeatUsage: number;
    averageSessionText: string;
    trustScore: number;
  }>;
};

async function upsertProviders() {
  const appleProvider = await prisma.providerConnection.upsert({
    where: { provider: ProviderType.APPLE },
    update: {
      status: ConnectionStatus.PENDING,
      accountLabel: 'Apple App Store Connect',
    },
    create: {
      provider: ProviderType.APPLE,
      status: ConnectionStatus.PENDING,
      accountLabel: 'Apple App Store Connect',
    },
  });

  const googleProvider = await prisma.providerConnection.upsert({
    where: { provider: ProviderType.GOOGLE },
    update: {
      status: ConnectionStatus.PENDING,
      accountLabel: 'Google Play Console',
    },
    create: {
      provider: ProviderType.GOOGLE,
      status: ConnectionStatus.PENDING,
      accountLabel: 'Google Play Console',
    },
  });

  return { appleProvider, googleProvider };
}

async function clearAppRelations(appId: string) {
  await prisma.appContent.deleteMany({ where: { appId } });
  await prisma.storeMetricSnapshot.deleteMany({ where: { appId } });
  await prisma.storeReview.deleteMany({ where: { appId } });
  await prisma.analyticsSnapshot.deleteMany({ where: { appId } });
  await prisma.appStoreMapping.deleteMany({ where: { appId } });
}

async function seedSingleApp(
  input: SeedAppInput,
  providerIds: { appleProviderId: string; googleProviderId: string },
) {
  const app = await prisma.app.upsert({
    where: { slug: input.slug },
    update: {
      internalName: input.internalName,
      isActive: true,
    },
    create: {
      slug: input.slug,
      internalName: input.internalName,
      isActive: true,
    },
  });

  await clearAppRelations(app.id);

  await prisma.appContent.createMany({
    data: input.contents.map((content) => ({
      appId: app.id,
      locale: content.locale,
      name: content.name,
      shortName: content.shortName,
      type: content.type,
      badge: content.badge,
      description: content.description,
      longDescription: content.longDescription,
      highlights: content.highlights,
      screenshots: content.screenshots,
      features: content.features,
      faqs: content.faqs,
      requirements: content.requirements,
      terms: content.terms,
      steps: content.steps,
      scores: content.scores,
      screenGradient: content.screenGradient,
      glowClass: content.glowClass,
      dark: content.dark,
    })),
  });

  await prisma.appStoreMapping.createMany({
    data: [
      {
        appId: app.id,
        providerId: providerIds.appleProviderId,
        storeAppId: `apple-${input.slug}`,
        bundleId: `com.qubi.${input.slug}.ios`,
        packageName: `com.qubi.${input.slug}.apple`,
        countryCode: 'US',
        discovered: false,
        isPrimary: true,
        lastDiscoveredAt: new Date(),
        lastSyncedAt: new Date(),
      },
      {
        appId: app.id,
        providerId: providerIds.googleProviderId,
        storeAppId: `google-${input.slug}`,
        bundleId: `com.qubi.${input.slug}.android`,
        packageName: `com.qubi.${input.slug}`,
        countryCode: 'US',
        discovered: false,
        isPrimary: true,
        lastDiscoveredAt: new Date(),
        lastSyncedAt: new Date(),
      },
    ],
  });

  await prisma.storeMetricSnapshot.createMany({
    data: [
      {
        appId: app.id,
        provider: ProviderType.APPLE,
        rating: input.metrics.apple.rating,
        reviewCount: input.metrics.apple.reviewCount,
        downloadEstimate: input.metrics.apple.downloadEstimate,
        versionLabel: input.metrics.apple.versionLabel,
        releaseStatus: input.metrics.apple.releaseStatus,
      },
      {
        appId: app.id,
        provider: ProviderType.GOOGLE,
        rating: input.metrics.google.rating,
        reviewCount: input.metrics.google.reviewCount,
        downloadEstimate: input.metrics.google.downloadEstimate,
        versionLabel: input.metrics.google.versionLabel,
        releaseStatus: input.metrics.google.releaseStatus,
      },
    ],
  });

  for (const review of input.reviews) {
    await prisma.storeReview.create({
      data: {
        appId: app.id,
        provider: review.provider,
        storeReviewId: review.storeReviewId,
        locale: review.locale,
        rating: review.rating,
        title: review.title,
        body: review.body,
        authorName: review.authorName,
        reviewCreatedAt: new Date(review.reviewCreatedAt),
      },
    });
  }

  await prisma.analyticsSnapshot.createMany({
    data: input.analytics.map((item) => ({
      appId: app.id,
      locale: item.locale,
      parentsReached: item.parentsReached,
      repeatUsage: item.repeatUsage,
      averageSessionText: item.averageSessionText,
      trustScore: item.trustScore,
    })),
  });
}

const apps: SeedAppInput[] = [
  {
    slug: 'wonder-tales',
    internalName: 'Wonder Tales',
    contents: [
      {
        locale: 'en',
        name: 'Wonder Tales',
        shortName: 'Wonder',
        type: 'Interactive story app',
        badge: 'Ages 4–8',
        description:
          'Story-led experiences with warm visuals, intuitive touch interactions and calm product rhythm.',
        longDescription:
          'Wonder Tales is designed for children who love to explore story worlds through visual scenes, gentle interactions and clear progress. It feels magical for kids while staying structured and trustworthy for parents.',
        highlights: [
          'Interactive chapters',
          'Calm progression',
          'Parent-friendly UX',
        ],
        screenshots: [
          'Home screen',
          'Story chapter',
          'Progress view',
          'Favorites',
        ],
        features: [
          'Immersive story-led navigation',
          'Child-friendly chapter progression',
          'Favorite stories and resume flow',
          'Warm visual language with calm pacing',
        ],
        faqs: [
          {
            question: 'Who is Wonder Tales designed for?',
            answer:
              'Wonder Tales is positioned for younger children who enjoy guided story exploration with simple, intuitive interactions.',
          },
          {
            question: 'What makes the experience parent-friendly?',
            answer:
              'The product language focuses on clarity, softer pacing and an interface that feels easy to understand at a glance.',
          },
        ],
        requirements: [
          'iOS and Android support',
          'Stable internet for sync features',
          'Parent email for profile setup',
        ],
        terms: [
          'Designed for children with parent onboarding',
          'Data usage is described in the privacy notice',
          'Account actions are managed by the parent profile',
        ],
        steps: [
          'Choose a story world based on age and mood.',
          'Tap through animated pages and interactive micro moments.',
          'Save favorites and continue from your last chapter.',
          'Parents can review activity and preferred content areas.',
        ],
        scores: [
          { label: 'Story quality', value: 98 },
          { label: 'Ease of use', value: 96 },
          { label: 'Visual trust', value: 95 },
          { label: 'Replay value', value: 92 },
        ],
        screenGradient: 'from-[#fff8de] via-[#ffe58e] to-[#facc15]',
        glowClass: 'bg-yellow-300/55',
        dark: false,
      },
      {
        locale: 'tr',
        name: 'Wonder Tales',
        shortName: 'Wonder',
        type: 'Etkileşimli hikâye uygulaması',
        badge: '4–8 yaş',
        description:
          'Sıcak görseller, sezgisel dokunmatik etkileşimler ve sakin bir ürün ritmiyle şekillenen hikâye odaklı deneyimler.',
        longDescription:
          'Wonder Tales, görsel sahneler, yumuşak etkileşimler ve net ilerleme yapısıyla hikâye dünyalarını keşfetmeyi seven çocuklar için tasarlandı. Çocuklar için büyüleyici hissettirirken ebeveynler için düzenli ve güvenilir bir yapı sunar.',
        highlights: [
          'Etkileşimli bölümler',
          'Sakin ilerleyiş',
          'Ebeveyn dostu UX',
        ],
        screenshots: [
          'Ana ekran',
          'Hikâye bölümü',
          'İlerleme görünümü',
          'Favoriler',
        ],
        features: [
          'Sürükleyici hikâye odaklı gezinme',
          'Çocuk dostu bölüm ilerleme yapısı',
          'Favori hikâyeler ve kaldığın yerden devam',
          'Sakin tempolu sıcak görsel dil',
        ],
        faqs: [
          {
            question: 'Wonder Tales kimler için tasarlandı?',
            answer:
              'Wonder Tales, basit ve sezgisel etkileşimlerle yönlendirmeli hikâye keşfini seven daha küçük yaş grubu çocuklar için konumlandırılmıştır.',
          },
          {
            question: 'Deneyimi ebeveyn dostu yapan şey nedir?',
            answer:
              'Ürün dili açıklığa, daha yumuşak akışlara ve ilk bakışta anlaşılması kolay bir arayüze odaklanır.',
          },
        ],
        requirements: [
          'iOS ve Android desteği',
          'Senkronizasyon özellikleri için stabil internet',
          'Profil kurulumu için ebeveyn e-postası',
        ],
        terms: [
          'Çocuklar için ebeveyn onboarding yapısıyla tasarlanmıştır',
          'Veri kullanımı gizlilik bildiriminde açıklanır',
          'Hesap işlemleri ebeveyn profili üzerinden yönetilir',
        ],
        steps: [
          'Yaşa ve ruh haline göre bir hikâye dünyası seç.',
          'Hareketli sayfalarda ve küçük etkileşim anlarında dokunarak ilerle.',
          'Favorilerini kaydet ve son kaldığın bölümden devam et.',
          'Ebeveynler etkinliği ve ilgi duyulan içerik alanlarını inceleyebilir.',
        ],
        scores: [
          { label: 'Hikâye kalitesi', value: 98 },
          { label: 'Kullanım kolaylığı', value: 96 },
          { label: 'Görsel güven', value: 95 },
          { label: 'Tekrar oynanabilirlik', value: 92 },
        ],
        screenGradient: 'from-[#fff8de] via-[#ffe58e] to-[#facc15]',
        glowClass: 'bg-yellow-300/55',
        dark: false,
      },
    ],
    metrics: {
      apple: {
        rating: 4.9,
        reviewCount: 18240,
        downloadEstimate: '620K+',
        versionLabel: '1.0.0',
        releaseStatus: 'PENDING_LAUNCH',
      },
      google: {
        rating: 4.8,
        reviewCount: 12610,
        downloadEstimate: '540K+',
        versionLabel: '1.0.0',
        releaseStatus: 'PENDING_LAUNCH',
      },
    },
    reviews: [
      {
        provider: ProviderType.APPLE,
        storeReviewId: 'apple-review-wonder-1',
        locale: 'en',
        rating: 5,
        title: 'Beautiful experience',
        body: 'Calm, polished and easy for children to enjoy.',
        authorName: 'A. Parent',
        reviewCreatedAt: '2026-04-10T10:00:00.000Z',
      },
      {
        provider: ProviderType.GOOGLE,
        storeReviewId: 'google-review-wonder-1',
        locale: 'tr',
        rating: 4,
        title: 'Güzel deneyim',
        body: 'Arayüz temiz ve ebeveyn açısından güven veriyor.',
        authorName: 'M. Kullanıcı',
        reviewCreatedAt: '2026-04-12T10:00:00.000Z',
      },
    ],
    analytics: [
      {
        locale: 'en',
        parentsReached: 41000,
        repeatUsage: 89,
        averageSessionText: '14 min',
        trustScore: 96,
      },
      {
        locale: 'tr',
        parentsReached: 41000,
        repeatUsage: 89,
        averageSessionText: '14 dk',
        trustScore: 96,
      },
    ],
  },
  {
    slug: 'speaky-steps',
    internalName: 'Speaky Steps',
    contents: [
      {
        locale: 'en',
        name: 'Speaky Steps',
        shortName: 'Speaky',
        type: 'English learning app',
        badge: 'Ages 5–10',
        description:
          'A playful mobile experience where children build vocabulary, listening and speaking confidence.',
        longDescription:
          'Speaky Steps turns language learning into a game-like journey with short daily lessons, child-friendly speaking prompts and visual rewards that keep progress simple and motivating.',
        highlights: [
          'Speaking prompts',
          'Listening practice',
          'Daily streak system',
        ],
        screenshots: [
          'Lesson hub',
          'Listening mode',
          'Speaking prompt',
          'Weekly report',
        ],
        features: [
          'Short lesson-based learning loops',
          'Listening and speaking interaction model',
          'Simple daily streak motivation',
          'Weekly progress reporting for parents',
        ],
        faqs: [
          {
            question:
              'What type of learning experience does Speaky Steps offer?',
            answer:
              'It is designed as a playful, structured language-learning journey with short sessions and clear progress cues.',
          },
          {
            question: 'Is the product built for repeat usage?',
            answer:
              'Yes. The flow uses light daily engagement patterns, saved progress and repeat-friendly lesson pacing.',
          },
        ],
        requirements: [
          'Microphone permission for speaking mode',
          'Internet connection for lesson sync',
          'Parent setup for progress dashboard',
        ],
        terms: [
          'Voice features require device permission',
          'Child activity appears in the parent overview',
          'Learning metrics are shown as product feedback tools',
        ],
        steps: [
          'Start with a simple placement flow and age-fit content.',
          'Complete short lessons with listening and speaking tasks.',
          'Unlock progress rewards and saved practice collections.',
          'Parents can review weekly learning summaries.',
        ],
        scores: [
          { label: 'Learning value', value: 97 },
          { label: 'Ease of use', value: 94 },
          { label: 'Engagement', value: 91 },
          { label: 'Progress clarity', value: 95 },
        ],
        screenGradient: 'from-[#111111] via-[#222222] to-[#facc15]',
        glowClass: 'bg-yellow-300/40',
        dark: true,
      },
      {
        locale: 'tr',
        name: 'Speaky Steps',
        shortName: 'Speaky',
        type: 'İngilizce öğrenme uygulaması',
        badge: '5–10 yaş',
        description:
          'Çocukların kelime bilgisini, dinleme becerisini ve konuşma özgüvenini geliştirdiği eğlenceli bir mobil deneyim.',
        longDescription:
          'Speaky Steps, dil öğrenimini kısa günlük dersler, çocuk dostu konuşma yönlendirmeleri ve ilerlemeyi basit ama motive edici hale getiren görsel ödüllerle oyun benzeri bir yolculuğa dönüştürür.',
        highlights: [
          'Konuşma yönlendirmeleri',
          'Dinleme pratiği',
          'Günlük seri sistemi',
        ],
        screenshots: [
          'Ders merkezi',
          'Dinleme modu',
          'Konuşma yönlendirmesi',
          'Haftalık rapor',
        ],
        features: [
          'Kısa ders odaklı öğrenme döngüleri',
          'Dinleme ve konuşma etkileşim modeli',
          'Basit günlük seri motivasyonu',
          'Ebeveynler için haftalık ilerleme raporları',
        ],
        faqs: [
          {
            question: 'Speaky Steps nasıl bir öğrenme deneyimi sunuyor?',
            answer:
              'Kısa oturumlar ve net ilerleme ipuçlarıyla eğlenceli ama yapılandırılmış bir dil öğrenme yolculuğu olarak tasarlanmıştır.',
          },
          {
            question: 'Ürün tekrar kullanım için uygun mu?',
            answer:
              'Evet. Akış, hafif günlük etkileşim kalıpları, kayıtlı ilerleme ve tekrar dostu ders temposu kullanır.',
          },
        ],
        requirements: [
          'Konuşma modu için mikrofon izni',
          'Ders senkronizasyonu için internet bağlantısı',
          'İlerleme paneli için ebeveyn kurulumu',
        ],
        terms: [
          'Ses özellikleri cihaz izni gerektirir',
          'Çocuk etkinliği ebeveyn görünümünde yer alır',
          'Öğrenme metrikleri ürün geri bildirim araçları olarak gösterilir',
        ],
        steps: [
          'Basit bir seviye belirleme akışı ve yaşa uygun içerikle başla.',
          'Dinleme ve konuşma görevleriyle kısa dersleri tamamla.',
          'İlerleme ödüllerini ve kayıtlı pratik koleksiyonlarını aç.',
          'Ebeveynler haftalık öğrenme özetlerini inceleyebilir.',
        ],
        scores: [
          { label: 'Öğrenme değeri', value: 97 },
          { label: 'Kullanım kolaylığı', value: 94 },
          { label: 'Etkileşim', value: 91 },
          { label: 'İlerleme netliği', value: 95 },
        ],
        screenGradient: 'from-[#111111] via-[#222222] to-[#facc15]',
        glowClass: 'bg-yellow-300/40',
        dark: true,
      },
    ],
    metrics: {
      apple: {
        rating: 4.8,
        reviewCount: 12440,
        downloadEstimate: '390K+',
        versionLabel: '1.0.0',
        releaseStatus: 'PENDING_LAUNCH',
      },
      google: {
        rating: 4.8,
        reviewCount: 9900,
        downloadEstimate: '390K+',
        versionLabel: '1.0.0',
        releaseStatus: 'PENDING_LAUNCH',
      },
    },
    reviews: [
      {
        provider: ProviderType.APPLE,
        storeReviewId: 'apple-review-speaky-1',
        locale: 'en',
        rating: 5,
        title: 'Great learning flow',
        body: 'My child loves the short speaking tasks.',
        authorName: 'L. Carter',
        reviewCreatedAt: '2026-04-10T11:00:00.000Z',
      },
      {
        provider: ProviderType.GOOGLE,
        storeReviewId: 'google-review-speaky-1',
        locale: 'tr',
        rating: 5,
        title: 'Çok faydalı',
        body: 'Dinleme ve konuşma bölümleri gerçekten başarılı.',
        authorName: 'S. Yılmaz',
        reviewCreatedAt: '2026-04-12T12:00:00.000Z',
      },
    ],
    analytics: [
      {
        locale: 'en',
        parentsReached: 26000,
        repeatUsage: 87,
        averageSessionText: '11 min',
        trustScore: 94,
      },
      {
        locale: 'tr',
        parentsReached: 26000,
        repeatUsage: 87,
        averageSessionText: '11 dk',
        trustScore: 94,
      },
    ],
  },
  {
    slug: 'tiny-logic',
    internalName: 'Tiny Logic',
    contents: [
      {
        locale: 'en',
        name: 'Tiny Logic',
        shortName: 'Logic',
        type: 'Puzzle & focus app',
        badge: 'Ages 6–10',
        description:
          'Mini-games designed to support memory, attention and pattern recognition through friendly interactions.',
        longDescription:
          'Tiny Logic focuses on short-form thinking activities that feel playful and energetic while still supporting concentration, structure recognition and repeat habit building for children.',
        highlights: [
          'Puzzle loops',
          'Focus routines',
          'Habit-building sessions',
        ],
        screenshots: [
          'Challenge board',
          'Puzzle round',
          'Focus timer',
          'Achievement wall',
        ],
        features: [
          'Short focus-friendly game loops',
          'Pattern recognition and logic tasks',
          'Habit-building session structure',
          'Achievement and progress feedback',
        ],
        faqs: [
          {
            question: 'What is Tiny Logic built to support?',
            answer:
              'Tiny Logic is positioned around focus, repeat interaction and playful cognitive challenge for children.',
          },
          {
            question: 'How does the product stay engaging?',
            answer:
              'It combines short-form challenge loops, achievement cues and a visually energetic but structured interface system.',
          },
        ],
        requirements: [
          'Recommended for independent play sessions',
          'Optional internet for cloud progress',
          'Parent profile for report access',
        ],
        terms: [
          'Usage timing can be guided by parent preferences',
          'Child progress is shown in simplified reporting',
          'Safe interaction flow with low-friction navigation',
        ],
        steps: [
          'Select a cognitive play track based on difficulty.',
          'Complete short puzzle rounds and timed focus sessions.',
          'Review streaks, achievements and unlocked challenges.',
          'Parents can see consistency and engagement patterns.',
        ],
        scores: [
          { label: 'Focus support', value: 94 },
          { label: 'Visual clarity', value: 93 },
          { label: 'Fun factor', value: 90 },
          { label: 'Repeat sessions', value: 88 },
        ],
        screenGradient: 'from-[#fff9df] via-[#ebf9cf] to-[#facc15]',
        glowClass: 'bg-lime-200/55',
        dark: false,
      },
      {
        locale: 'tr',
        name: 'Tiny Logic',
        shortName: 'Logic',
        type: 'Bulmaca ve odak uygulaması',
        badge: '6–10 yaş',
        description:
          'Hafıza, dikkat ve örüntü tanımayı dostça etkileşimlerle desteklemek için tasarlanmış mini oyunlar.',
        longDescription:
          'Tiny Logic, çocuklar için oyunlu ve enerjik hissettirirken aynı zamanda konsantrasyon, yapı tanıma ve tekrar alışkanlığı oluşturmayı destekleyen kısa formatlı düşünme aktivitelerine odaklanır.',
        highlights: [
          'Bulmaca döngüleri',
          'Odak rutinleri',
          'Alışkanlık oluşturan seanslar',
        ],
        screenshots: [
          'Görev panosu',
          'Bulmaca turu',
          'Odak zamanlayıcısı',
          'Başarı duvarı',
        ],
        features: [
          'Kısa odak dostu oyun döngüleri',
          'Örüntü tanıma ve mantık görevleri',
          'Alışkanlık oluşturan seans yapısı',
          'Başarı ve ilerleme geri bildirimi',
        ],
        faqs: [
          {
            question: 'Tiny Logic neyi desteklemek için geliştirildi?',
            answer:
              'Tiny Logic, çocuklar için odak, tekrar etkileşimi ve eğlenceli bilişsel meydan okuma etrafında konumlandırılmıştır.',
          },
          {
            question: 'Ürün nasıl ilgi çekici kalıyor?',
            answer:
              'Kısa meydan okuma döngülerini, başarı işaretlerini ve enerjik ama düzenli bir arayüz sistemiyle birleştirir.',
          },
        ],
        requirements: [
          'Bağımsız oyun seansları için önerilir',
          'Bulut ilerlemesi için isteğe bağlı internet',
          'Rapor erişimi için ebeveyn profili',
        ],
        terms: [
          'Kullanım süresi ebeveyn tercihlerine göre yönlendirilebilir',
          'Çocuk ilerlemesi sadeleştirilmiş raporlarda gösterilir',
          'Düşük sürtünmeli gezinme ile güvenli etkileşim akışı',
        ],
        steps: [
          'Zorluk seviyesine göre bilişsel oyun parkuru seç.',
          'Kısa bulmaca turlarını ve zamanlı odak seanslarını tamamla.',
          'Serilerini, başarılarını ve açılan görevleri incele.',
          'Ebeveynler süreklilik ve etkileşim kalıplarını görebilir.',
        ],
        scores: [
          { label: 'Odak desteği', value: 94 },
          { label: 'Görsel netlik', value: 93 },
          { label: 'Eğlence seviyesi', value: 90 },
          { label: 'Tekrar seansları', value: 88 },
        ],
        screenGradient: 'from-[#fff9df] via-[#ebf9cf] to-[#facc15]',
        glowClass: 'bg-lime-200/55',
        dark: false,
      },
    ],
    metrics: {
      apple: {
        rating: 4.7,
        reviewCount: 7800,
        downloadEstimate: '210K+',
        versionLabel: '1.0.0',
        releaseStatus: 'PENDING_LAUNCH',
      },
      google: {
        rating: 4.7,
        reviewCount: 6400,
        downloadEstimate: '210K+',
        versionLabel: '1.0.0',
        releaseStatus: 'PENDING_LAUNCH',
      },
    },
    reviews: [
      {
        provider: ProviderType.APPLE,
        storeReviewId: 'apple-review-logic-1',
        locale: 'en',
        rating: 4,
        title: 'Smart and fun',
        body: 'The puzzles are short and well paced.',
        authorName: 'D. Smith',
        reviewCreatedAt: '2026-04-09T10:00:00.000Z',
      },
      {
        provider: ProviderType.GOOGLE,
        storeReviewId: 'google-review-logic-1',
        locale: 'tr',
        rating: 5,
        title: 'Çok keyifli',
        body: 'Odak ve bulmaca tarafı gayet iyi düşünülmüş.',
        authorName: 'E. Kaya',
        reviewCreatedAt: '2026-04-11T14:00:00.000Z',
      },
    ],
    analytics: [
      {
        locale: 'en',
        parentsReached: 17000,
        repeatUsage: 84,
        averageSessionText: '9 min',
        trustScore: 92,
      },
      {
        locale: 'tr',
        parentsReached: 17000,
        repeatUsage: 84,
        averageSessionText: '9 dk',
        trustScore: 92,
      },
    ],
  },
];

async function main() {
  const { appleProvider, googleProvider } = await upsertProviders();

  for (const app of apps) {
    await seedSingleApp(app, {
      appleProviderId: appleProvider.id,
      googleProviderId: googleProvider.id,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
