import config from '@payload-config'
import { getPayload } from 'payload'

import { richTextFrom } from '../src/lib/lexical'

/**
 * Fills an empty database with realistic bilingual content so the site and the
 * admin panel are usable straight after `pnpm install`.
 *
 * Safe to re-run: every step checks for existing data first.
 */

const seed = async () => {
  const payload = await getPayload({ config })

  // --- Admin user -----------------------------------------------------------
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@coffeesf.local'
  const password = process.env.SEED_ADMIN_PASSWORD || 'changeme123'

  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email, password, name: 'Admin' },
    })
    payload.logger.info(`Created admin user: ${email}`)
  } else {
    payload.logger.info('Users already exist — skipping admin creation.')
  }

  const existingProjects = await payload.find({ collection: 'projects', limit: 1 })
  if (existingProjects.totalDocs > 0) {
    payload.logger.info('Content already seeded — nothing more to do.')
    return
  }

  /** Creates a document in Ukrainian, then adds the English translation. */
  const createLocalized = async <T extends 'projects' | 'events' | 'work-areas' | 'locations'>(
    collection: T,
    uk: Record<string, unknown>,
    en: Record<string, unknown>,
  ) => {
    const doc = await payload.create({
      collection,
      locale: 'uk',
      data: uk as never,
    })
    await payload.update({
      collection,
      id: doc.id,
      locale: 'en',
      data: en as never,
    })
    return doc
  }

  // --- Location -------------------------------------------------------------
  const kyiv = await createLocalized(
    'locations',
    {
      name: 'Кава Спецпризначення — Київ',
      slug: 'kyiv',
      address: 'вул. Хрещатик, 22, Київ',
      openingHours: 'Пн–Пт: 8:00–20:00\nСб–Нд: 9:00–18:00',
      phone: '+380 44 000 0000',
      mapUrl: 'https://maps.google.com/?q=Khreshchatyk+22+Kyiv',
      description:
        'Наша перша кав’ярня. Увесь прибуток від кожної чашки йде на підтримку захисників та захисниць.',
    },
    {
      name: 'Coffee Special Forces — Kyiv',
      address: '22 Khreshchatyk St, Kyiv',
      openingHours: 'Mon–Fri: 8:00–20:00\nSat–Sun: 9:00–18:00',
      description:
        'Our first coffee shop. Every hryvnia of profit from every cup goes to supporting our defenders.',
    },
  )

  // --- Work areas -----------------------------------------------------------
  const areaDefinitions = [
    {
      uk: {
        title: 'Кавові збори',
        slug: 'coffee-fundraisers',
        order: 1,
        description: 'Тематичні дні у кав’ярні, коли весь виторг спрямовується на конкретний збір.',
      },
      en: {
        title: 'Coffee fundraisers',
        description:
          'Themed days at the shop where the entire day’s takings go to one specific campaign.',
      },
    },
    {
      uk: {
        title: 'Тактична медицина',
        slug: 'tactical-medicine',
        order: 2,
        description:
          'Безкоштовні курси домедичної допомоги для цивільних та військових у приміщенні кав’ярні.',
      },
      en: {
        title: 'Tactical medicine',
        description:
          'Free pre-hospital care courses for civilians and service members, held at the shop.',
      },
    },
    {
      uk: {
        title: 'Підтримка ветеранів',
        slug: 'veteran-support',
        order: 3,
        description:
          'Робочі місця, бариста-навчання та регулярні зустрічі спільноти для ветеранів.',
      },
      en: {
        title: 'Veteran support',
        description:
          'Jobs, barista training and a regular community meet-up for veterans and their families.',
      },
    },
  ]

  const areas: Record<string, number | string> = {}
  for (const definition of areaDefinitions) {
    const doc = await createLocalized('work-areas', definition.uk, definition.en)
    areas[definition.uk.slug] = doc.id
  }

  // --- Projects -------------------------------------------------------------
  const projectDefinitions = [
    {
      uk: {
        title: 'Пікап для 47-ї бригади',
        slug: 'pickup-47-brigade',
        status: 'active',
        featured: true,
        goalAmount: 850000,
        raisedAmount: 512000,
        currency: 'UAH',
        startDate: '2026-06-01T09:00:00.000Z',
        location: kyiv.id,
        summary:
          'Збираємо на повнопривідний пікап для евакуаційної групи. Машина потрібна вже вчора.',
        content: richTextFrom([
          'Евакуаційна група 47-ї бригади втратила транспорт під час ротації. Без пікапа поранених доводиться виносити пішки кілометрами.',
          'Ми домовилися про перевірену вживану машину та вже маємо волонтерів, готових пригнати її з Польщі. Лишилося зібрати суму.',
          'Кожна чашка кави, куплена у нас цього місяця, додає 20 гривень до цього збору.',
        ]),
      },
      en: {
        title: 'Pickup truck for the 47th Brigade',
        status: 'active',
        summary:
          'Raising funds for a 4x4 pickup for a casualty evacuation team. The vehicle was needed yesterday.',
        content: richTextFrom([
          'The 47th Brigade’s evacuation team lost their vehicle during a rotation. Without a pickup, the wounded have to be carried out on foot, for kilometres.',
          'We have found a vetted second-hand vehicle and volunteers ready to drive it over from Poland. All that is left is the money.',
          'Every cup of coffee bought from us this month adds 20 UAH to this campaign.',
        ]),
      },
    },
    {
      uk: {
        title: 'Аптечки для тактичної медицини',
        slug: 'tactical-medicine-kits',
        status: 'active',
        featured: true,
        goalAmount: 240000,
        raisedAmount: 198500,
        currency: 'UAH',
        startDate: '2026-07-15T09:00:00.000Z',
        location: kyiv.id,
        summary:
          'Сто індивідуальних аптечок для підрозділів, що проходять навчання у нашій кав’ярні.',
        content: richTextFrom([
          'Ми навчаємо домедичній допомозі — але вміння без аптечки не рятує. Тому кожен випускник наших курсів має отримати повний набір.',
          'Один комплект коштує близько 2 400 грн: турнікет, оклюзійна наліпка, бинт, ножиці та термоковдра.',
        ]),
      },
      en: {
        title: 'Individual first aid kits',
        status: 'active',
        summary: 'One hundred IFAKs for the units training in our coffee shop.',
        content: richTextFrom([
          'We teach pre-hospital care — but the skill saves nobody without a kit. So every graduate of our course should leave with a full set.',
          'One kit costs around 2,400 UAH: tourniquet, chest seal, bandage, shears and a thermal blanket.',
        ]),
      },
    },
    {
      uk: {
        title: 'Генератор для військового шпиталю',
        slug: 'hospital-generator',
        status: 'completed',
        goalAmount: 320000,
        raisedAmount: 320000,
        currency: 'UAH',
        startDate: '2026-01-10T09:00:00.000Z',
        endDate: '2026-03-02T09:00:00.000Z',
        location: kyiv.id,
        summary: 'Закрито за 51 день. Генератор працює у операційній з березня.',
        content: richTextFrom([
          'Збір закрито. Дизельний генератор на 30 кВт встановлено та підключено до операційного блоку.',
          'Дякуємо всім, хто пив каву заради цього.',
        ]),
      },
      en: {
        title: 'Generator for a military hospital',
        status: 'completed',
        summary:
          'Closed in 51 days. The generator has been running in the operating theatre since March.',
        content: richTextFrom([
          'Campaign closed. A 30 kW diesel generator has been installed and wired into the surgical block.',
          'Thank you to everyone who drank coffee for this.',
        ]),
      },
    },
    {
      uk: {
        title: 'Кава на передову',
        slug: 'coffee-to-the-front',
        status: 'completed',
        goalAmount: 90000,
        raisedAmount: 104300,
        currency: 'UAH',
        startDate: '2025-11-01T09:00:00.000Z',
        endDate: '2025-12-20T09:00:00.000Z',
        summary: 'Півтонни свіжообсмаженої кави та 40 турок відправлені на позиції.',
        content: richTextFrom([
          'Зібрали більше, ніж планували. 500 кілограмів кави, 40 турок та 12 ручних кавомолок поїхали на схід.',
        ]),
      },
      en: {
        title: 'Coffee to the front line',
        status: 'completed',
        summary: 'Half a tonne of freshly roasted coffee and 40 pots delivered to positions.',
        content: richTextFrom([
          'We raised more than we planned. 500 kilograms of coffee, 40 cezves and 12 hand grinders went east.',
        ]),
      },
    },
  ]

  for (const definition of projectDefinitions) {
    await createLocalized('projects', definition.uk, definition.en)
  }

  // --- Events ---------------------------------------------------------------
  const eventDefinitions = [
    {
      uk: {
        title: 'Кавовий день на підтримку 47-ї',
        slug: 'coffee-day-47',
        date: '2026-10-18T09:00:00.000Z',
        workArea: areas['coffee-fundraisers'],
        location: kyiv.id,
        summary: 'Увесь виторг дня — на пікап для евакуаційної групи.',
        content: richTextFrom([
          'Приходьте на каву з 8:00 до 20:00. Кожна чашка цього дня повністю йде у збір на пікап.',
        ]),
      },
      en: {
        title: 'Coffee day for the 47th',
        summary: 'The whole day’s takings go to the evacuation team’s pickup.',
        content: richTextFrom([
          'Come for coffee between 8:00 and 20:00. Every cup sold that day goes straight into the pickup campaign.',
        ]),
      },
    },
    {
      uk: {
        title: 'Курс домедичної допомоги — базовий рівень',
        slug: 'first-aid-basic-october',
        date: '2026-10-25T07:00:00.000Z',
        workArea: areas['tactical-medicine'],
        location: kyiv.id,
        summary: 'Восьмигодинний курс для цивільних. Безкоштовно, за попереднім записом.',
        content: richTextFrom([
          'Турнікет, зупинка кровотечі, положення тіла, виклик допомоги. Практика на манекенах.',
          'Група до 12 осіб. Запис через наш Instagram.',
        ]),
      },
      en: {
        title: 'Pre-hospital care course — basic level',
        summary: 'An eight-hour course for civilians. Free, registration required.',
        content: richTextFrom([
          'Tourniquets, bleeding control, body positioning, calling for help. Practice on manikins.',
          'Groups of up to 12. Register through our Instagram.',
        ]),
      },
    },
    {
      uk: {
        title: 'Зустріч ветеранської спільноти',
        slug: 'veteran-meetup-october',
        date: '2026-10-11T15:00:00.000Z',
        workArea: areas['veteran-support'],
        location: kyiv.id,
        summary: 'Щомісячна зустріч. Кава за наш рахунок.',
        content: richTextFrom([
          'Неформальна зустріч ветеранів та їхніх родин. Без програми та промов — просто розмова.',
        ]),
      },
      en: {
        title: 'Veteran community meet-up',
        summary: 'Our monthly gathering. Coffee is on us.',
        content: richTextFrom([
          'An informal meet-up for veterans and their families. No programme, no speeches — just conversation.',
        ]),
      },
    },
    {
      uk: {
        title: 'Бариста-курс для ветеранів',
        slug: 'barista-course-veterans',
        date: '2026-08-30T07:00:00.000Z',
        workArea: areas['veteran-support'],
        location: kyiv.id,
        summary: 'Двотижневе навчання з подальшим працевлаштуванням.',
        content: richTextFrom([
          'Перший потік завершено: шестеро випускників, четверо вже працюють у кав’ярнях Києва.',
        ]),
      },
      en: {
        title: 'Barista course for veterans',
        summary: 'A two-week course with a job at the end of it.',
        content: richTextFrom([
          'The first intake is finished: six graduates, four of them already working in Kyiv coffee shops.',
        ]),
      },
    },
    {
      uk: {
        title: 'Благодійний аукціон кавових лотів',
        slug: 'coffee-auction',
        date: '2026-05-17T13:00:00.000Z',
        workArea: areas['coffee-fundraisers'],
        location: kyiv.id,
        summary: 'Рідкісні лоти зерна та підписані турки. Зібрано 74 000 грн.',
        content: richTextFrom(['Аукціон завершено. Виручені кошти пішли на аптечки.']),
      },
      en: {
        title: 'Charity coffee auction',
        summary: 'Rare bean lots and signed cezves. Raised 74,000 UAH.',
        content: richTextFrom(['The auction is over. The proceeds went towards first aid kits.']),
      },
    },
  ]

  for (const definition of eventDefinitions) {
    await createLocalized('events', definition.uk, definition.en)
  }

  // --- Globals --------------------------------------------------------------
  const globals = [
    {
      slug: 'site-settings' as const,
      uk: {
        siteName: 'Кава Спецпризначення',
        tagline: 'Волонтерський проєкт. Кав’ярня, що працює на перемогу.',
        contactEmail: 'hello@coffeesf.org',
        footerText:
          'Благодійна організація «Благодійний фонд “Кава Спецпризначення”». Усі звіти публікуються щоквартально.',
        socialLinks: [
          { label: 'Instagram', url: 'https://instagram.com/' },
          { label: 'Telegram', url: 'https://t.me/' },
        ],
      },
      en: {
        siteName: 'Coffee Special Forces',
        tagline: 'A volunteer project. A coffee shop that works for victory.',
        footerText:
          'Registered charity “Coffee Special Forces Foundation”. Reports are published every quarter.',
      },
    },
    {
      slug: 'home' as const,
      uk: {
        heroHeading: 'Кожна чашка працює на перемогу',
        heroSubheading:
          'Ми — кав’ярня у центрі Києва. Увесь прибуток іде на збори для військових, навчання з тактичної медицини та підтримку ветеранів.',
        aboutHeading: 'Хто ми',
        aboutText: richTextFrom([
          '«Кава Спецпризначення» почалася з однієї кавомашини та переконання, що волонтерство має бути щоденним, а не героїчним.',
          'Сьогодні це кав’ярня, навчальний майданчик і благодійний фонд в одному приміщенні на Хрещатику. Ми не беремо відсотка на адміністрування: зарплати покриває виторг з кави, а донати йдуть у збори повністю.',
        ]),
        stats: [
          { value: '2.1 млн ₴', label: 'зібрано з 2023 року' },
          { value: '340', label: 'випускників курсів' },
          { value: '12', label: 'закритих зборів' },
          { value: '6', label: 'ветеранів працевлаштовано' },
        ],
      },
      en: {
        heroHeading: 'Every cup works for victory',
        heroSubheading:
          'We are a coffee shop in central Kyiv. All profit goes to military fundraisers, tactical medicine training and veteran support.',
        aboutHeading: 'Who we are',
        aboutText: richTextFrom([
          'Coffee Special Forces started with a single espresso machine and the conviction that volunteering should be an everyday habit rather than an act of heroism.',
          'Today it is a coffee shop, a training space and a charitable foundation in one room on Khreshchatyk. We take no administrative cut: coffee sales cover the wages, and donations go into the campaigns in full.',
        ]),
        stats: [
          { value: '₴2.1M', label: 'raised since 2023' },
          { value: '340', label: 'course graduates' },
          { value: '12', label: 'campaigns closed' },
          { value: '6', label: 'veterans employed' },
        ],
      },
    },
    {
      slug: 'donate' as const,
      uk: {
        heading: 'Підтримати',
        intro:
          'Оберіть зручний спосіб. Якщо донат призначений для конкретного збору — вкажіть його назву у коментарі до платежу.',
        methods: [
          {
            label: 'Банка в monobank',
            url: 'https://send.monobank.ua/',
            description: 'Найшвидший спосіб, будь-яка сума',
          },
          { label: 'PayPal', url: 'https://paypal.me/', description: 'Для донатів з-за кордону' },
        ],
        recipient: 'БО «БФ “Кава Спецпризначення”»',
        iban: 'UA123456000000000000000000000',
        taxId: '12345678',
        paymentPurpose: 'Благодійна допомога. Без ПДВ.',
      },
      en: {
        heading: 'Support us',
        intro:
          'Pick whichever is easiest. If your donation is for a specific campaign, name it in the payment reference.',
        methods: [
          {
            label: 'monobank jar',
            url: 'https://send.monobank.ua/',
            description: 'Fastest option, any amount',
          },
          { label: 'PayPal', url: 'https://paypal.me/', description: 'For donations from abroad' },
        ],
        recipient: 'Coffee Special Forces Charitable Foundation',
        paymentPurpose: 'Charitable donation. VAT exempt.',
      },
    },
    {
      slug: 'foundation' as const,
      uk: {
        heading: 'Благодійний фонд',
        story: richTextFrom([
          'Благодійний фонд «Кава Спецпризначення» зареєстровано у 2023 році. Фонд акумулює кошти від продажу кави та адресних донатів і спрямовує їх на закупівлі за запитами підрозділів.',
          'Ми публікуємо квартальні звіти з переліком закупівель і сумами. Первинні документи надаємо на запит будь-якого донора.',
        ]),
        legalName: 'Благодійна організація «Благодійний фонд “Кава Спецпризначення”»',
        registrationNumber: '12345678',
        legalAddress: 'вул. Хрещатик, 22, Київ, 01001',
        contactEmail: 'foundation@coffeesf.org',
        contactPhone: '+380 44 000 0000',
        reports: [
          { title: 'Річний звіт за 2025 рік', year: 2025 },
          { title: 'Звіт за I півріччя 2026', year: 2026 },
        ],
      },
      en: {
        heading: 'Charitable foundation',
        story: richTextFrom([
          'The Coffee Special Forces Charitable Foundation was registered in 2023. It pools income from coffee sales and earmarked donations, and spends it on purchases requested directly by units.',
          'We publish quarterly reports listing every purchase and its cost. Source documents are available to any donor on request.',
        ]),
        legalName: 'Coffee Special Forces Charitable Foundation',
        legalAddress: '22 Khreshchatyk St, Kyiv, 01001',
        reports: [
          { title: 'Annual report 2025', year: 2025 },
          { title: 'Half-year report 2026', year: 2026 },
        ],
      },
    },
  ]

  /**
   * Array rows are shared between locales — only the fields inside them are
   * translated. Writing the English pass without each row's id would append a
   * second set of rows rather than translate the existing ones, so the ids are
   * carried across from the Ukrainian pass by position.
   */
  const withRowIds = (
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ): Record<string, unknown> => {
    const merged: Record<string, unknown> = { ...target }
    for (const [key, value] of Object.entries(target)) {
      const sourceRows = source[key]
      if (!Array.isArray(value) || !Array.isArray(sourceRows)) continue
      merged[key] = value.map((row, index) => {
        const id = (sourceRows[index] as { id?: string } | undefined)?.id
        return id ? { ...(row as object), id } : row
      })
    }
    return merged
  }

  for (const global of globals) {
    await payload.updateGlobal({ slug: global.slug, locale: 'uk', data: global.uk as never })
    const ukVersion = (await payload.findGlobal({
      slug: global.slug,
      locale: 'uk',
      depth: 0,
    })) as unknown as Record<string, unknown>
    await payload.updateGlobal({
      slug: global.slug,
      locale: 'en',
      data: withRowIds(global.en, ukVersion) as never,
    })
  }

  payload.logger.info('Seed complete.')
}

await seed()
process.exit(0)
