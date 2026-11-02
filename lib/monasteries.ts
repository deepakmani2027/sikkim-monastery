import { toSlugId } from "./utils/slug"
export interface Monastery {
  id: string
  name: string
  location: string
  district: string
  coordinates: {
    lat: number
    lng: number
  }
  description: string
  history: string
  significance: string
  founded: string
      narration?: {
        [lang: string]: {
          text: string
          audioUrl?: string
        }
      }
  architecture: string
  images: string[]
  virtualTour?: {
    available: boolean
    url?: string
    scenes?: Array<{
      id: string
      title: string
      image: string
      videoUrl?: string
      haov?: number
      vaov?: number
      vOffset?: number
      hotspots?: Array<{
        pitch: number
        yaw: number
        type: string
        text: string
        sceneId?: string
      }>
      narration?: {
        [langCode: string]: {
          text?: string
          audioUrl?: string
        }
      }
    }>
  }
  audioGuide?: {
    available: boolean
    languages: string[]
    duration: string
  }
  visitingInfo: {
    openingHours: string
    entryFee: string
    bestTimeToVisit: string
    accessibility: string
  }
  festivals: Array<{
    name: string
    date: string
    description: string
    sources?: Array<{ label: string; url: string }>
  }>
  rating: number
  reviews: number
  category: string
  tags: string[]
}

export const monasteries: Monastery[] = [
  {
    id: "rumtek",
    name: "Rumtek Monastery",
    location: "Rumtek, Gangtok",
    district: "East Sikkim",
    coordinates: { lat: 27.3389, lng: 88.5583 },
    description: "The largest monastery in Sikkim and the main seat of the Karma Kagyu lineage outside Tibet.",
    history:
      "Built in the 1960s by the 16th Karmapa, Rangjung Rigpe Dorje, as the main seat of the Karma Kagyu lineage in exile.",
  significance: `Rumtek is the most important monastery of the Karma Kagyu sect in exile and serves as the main seat of the Karmapa in India. It is often referred to as the "Dharma Chakra Centre" and is a hub of spiritual learning and practice. Pilgrims and tourists visit it not only for its religious importance but also for its breathtaking views of Gangtok and the lush hills around it.`,
  founded: `1966 by the 16th Karmapa, Rangjung Rigpe Dorje, though its original foundation traces back to the 12th century in Tibet.`,
  architecture: `The monastery reflects traditional Tibetan Buddhist architecture with a golden roof, intricately carved woodwork, and ornate murals. The main shrine hall is richly decorated with thangkas, silk paintings, and statues. Surrounding the monastery are monk quarters, a monastic college, and a golden stupa containing the relics of the 16th Karmapa.`,
    images: [
      "/rumtek-monastery-sikkim-buddhist-temple.jpg",
      "/rumtek-monastery-interior-golden-buddha.jpg",
      "/rumtek-monastery-courtyard-prayer-flags.jpg",
    ],
    virtualTour: {
      available: true,
      scenes: [
        {
          id: "main-hall",
          title: "Main Prayer Hall",
          image: "/rumtek-monastery-main-hall-360-view.jpg",
          narration: {
            en: {
              text:
                "You are in Rumtek’s main prayer hall. Notice the golden Buddha statue, vibrant murals, and thangkas that narrate Buddhist teachings and lineage history.",
            },
            hi: {
              text:
                "आप रुमटेक के मुख्य प्रार्थना कक्ष में हैं। सुनहरे बुद्ध प्रतिमा, जीवंत भित्तिचित्र और थांका परंपरा और बौद्ध शिक्षाओं की कथा कहते हैं।",
            },
            ne: {
              text:
                "तपाईं रुमटेकको मुख्य प्रार्थना हलमा हुनुहुन्छ। सुनौलो बुद्ध मूर्ति, रङ्गीन भित्तेचित्र र थाङ्काहरूले बौद्ध शिक्षाहरूको कथा सुनाउँछन्।",
            },
            fr: { text: "Vous êtes dans la grande salle de prière de Rumtek. Remarquez la statue dorée du Bouddha et les fresques colorées racontant les enseignements bouddhistes." },
            ja: { text: "ここはルムテック僧院の本堂です。金色の仏像と、教えを物語る色鮮やかな壁画に注目してください。" },
            zh: { text: "您正置身于鲁姆泰寺的大殿。请留意金色佛像与色彩斑斓的壁画，它们讲述着佛教的教义与传承。" },
          },
          hotspots: [
            { pitch: -10, yaw: 0, type: "info", text: "Golden Buddha statue - 16th century craftsmanship" },
            { pitch: 5, yaw: 90, type: "info", text: "Traditional Tibetan murals depicting Buddhist teachings" },
            { pitch: 0, yaw: 170, type: "scene", text: "Go to Courtyard", sceneId: "courtyard" },
          ],
        },
        {
          id: "courtyard",
          title: "Main Courtyard",
          image: "/rumtek-monastery-courtyard-360-panoramic-view.jpg",
          narration: {
            en: { text: "This is the main courtyard where festivals and cham dances take place. Prayer wheels line the walls inviting blessings." },
            hi: { text: "यह मुख्य आँगन है जहाँ त्योहार और छम नृत्य होते हैं। दीवारों के साथ प्रार्थना चक्के आशीर्वाद के लिए आमंत्रित करते हैं।" },
            ne: { text: "यो मुख्य आँगन हो जहाँ पर्व र छाम नृत्यहरू हुने गर्छन्। भित्ताहरूमा प्रार्थना चर्खाहरूले आशीर्वादको निम्ति बोलाउँछन्।" },
            fr: { text: "Voici la cour principale où ont lieu les festivals et danses cham. Les moulins à prières longent les murs." },
            ja: { text: "ここは祭りやチャム舞が行われる中庭です。祈祷輪が壁沿いに並んでいます。" },
            zh: { text: "这是举行节庆与羌姆舞的主庭院。转经轮沿墙排列，祈愿祝福。" },
          },
          hotspots: [
            { pitch: 0, yaw: 180, type: "info", text: "Prayer wheels - spin clockwise for blessings" },
            { pitch: 0, yaw: -10, type: "scene", text: "Enter Main Hall", sceneId: "main-hall" },
          ],
        },
      ],
    },
    audioGuide: {
      available: true,
      languages: ["English", "Hindi", "Nepali", "Tibetan"],
      duration: "45 minutes",
    },
    visitingInfo: {
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: "Free (Photography fee: ₹20)",
      bestTimeToVisit: "March to June, September to December",
      accessibility: "Wheelchair accessible main areas",
    },
    festivals: [
      {
        name: "Losar (Tibetan New Year)",
        date: "February–March",
        description: "The Tibetan New Year marked with multi‑day celebrations at Rumtek including prayers, music, and community festivities.",
        sources: [
          { label: "thesikkim.com", url: "https://www.thesikkim.com/destinations/rumtek-monastery-gangtok-sikkim?utm_source=chatgpt.com" },
        ],
      },
      {
        name: "Gutor / Guthor Cham",
        date: "February–March",
        description: "Ritual masked dances to purge negativities and obstacles before the New Year; performed near the end of the 12th Tibetan lunar month.",
        sources: [
          { label: "Windhorse Tours", url: "https://www.windhorsetours.com/festival/rumtek-guthor/?utm_source=chatgpt.com" },
        ],
      },
      {
        name: "Mahakala Protector Practice",
        date: "February–March",
        description: "Ten‑day protector deity practice culminating in the Mahakala cham on the 29th day; purification and protection rituals.",
        sources: [
          { label: "indovacations.net", url: "https://www.indovacations.net/english/Sikkim_Rumtekmonastery.htm?utm_source=chatgpt.com" },
        ],
      },
      {
        name: "Dungdrub Puja",
        date: "May–June",
        description: "Extensive pujas with mantra recitations for world peace and collective well‑being.",
        sources: [
          { label: "TripFactory", url: "https://holidays.tripfactory.com/sikkim/rumtek-monastery-guide/?utm_source=chatgpt.com" },
        ],
      },
      {
        name: "Vajrakilaya Drupchen",
        date: "May–June (alternate years)",
        description: "Ten‑day intensive practice dedicated to Vajrakilaya/Guru Padmasambhava with cham dances and elaborate rituals.",
        sources: [
          { label: "TripFactory", url: "https://holidays.tripfactory.com/sikkim/rumtek-monastery-guide/?utm_source=chatgpt.com" },
        ],
      },
      {
        name: "Birthday of the 17th Karmapa",
        date: "June (around 26th)",
        description: "Annual commemoration with sacred dance and cultural programs honoring His Holiness the 17th Karmapa.",
        sources: [
          { label: "TripFactory", url: "https://holidays.tripfactory.com/sikkim/rumtek-monastery-guide/?utm_source=chatgpt.com" },
        ],
      },
      {
        name: "Monks’ Retreat / Gakye",
        date: "July–August",
        description: "~45‑day summer retreat of the monastic community, concluding with dedicated ceremonies and prayers.",
        sources: [
          { label: "thesikkim.com", url: "https://www.thesikkim.com/destinations/rumtek-monastery-gangtok-sikkim?utm_source=chatgpt.com" },
        ],
      },
    ],
    rating: 4.8,
    reviews: 1247,
    category: "Major Monastery",
    tags: ["Karma Kagyu", "Virtual Tour", "Audio Guide", "Photography"],
  },
  {
    id: "pemayangtse",
    name: "Pemayangtse Monastery",
    location: "Pelling, West Sikkim",
    district: "West Sikkim",
    coordinates: { lat: 27.2951, lng: 88.2158 },
    description: "One of the oldest and most important monasteries in Sikkim, offering stunning views of Kanchenjunga.",
  history: "Founded in 1705 by Lama Lhatsun Chempo and expanded by successive Nyingma masters; it's the head monastery of the Nyingma order in Sikkim.",
  significance: `Pemayangtse, meaning "Perfect Sublime Lotus," is one of the most sacred monasteries of the Nyingma order. It played a central role in the coronation of Sikkim’s kings (Chogyals). The monastery is also known for the annual Cham (masked) dances, which depict the triumph of good over evil and attract devotees from across the region.`,
  founded: `1705 by Lama Lhatsun Chempo and later expanded by successive Nyingma masters.`,
  architecture: `A three-storied monastery featuring traditional Tibetan woodwork, statues, and murals. The top floor houses a remarkable seven-tiered wooden structure called Sangtok Palri, which represents the heavenly abode of Guru Padmasambhava. Its intricate hand-carved details make it one of the finest artistic masterpieces of Sikkimese monastic craftsmanship.`,
    images: [
      "/pemayangtse-monastery-sikkim-mountain-view.jpg",
      "/pemayangtse-monastery-interior-wooden-sculptures.jpg",
      "/pemayangtse-monastery-kanchenjunga-view.jpg",
    ],
    virtualTour: {
      available: true,
      scenes: [
        {
          id: "main-shrine",
          title: "Main Shrine Room",
          image: "/pemayangtse-monastery-shrine-room-360-view.jpg",
          narration: {
            en: { text: "Pemayangtse’s shrine holds ancient images and sacred objects of the Nyingma tradition. Observe the serene arrangement and murals." },
            hi: { text: "पेमायंग्त्से का मुख्य श्राइन न्यिंगमा परम्परा की प्राचीन मूर्तियाँ और पवित्र वस्तुओं को संजोए है।" },
            ne: { text: "पेमायाङ्त्सेको मुख्य देवालयमा न्यिङ्मा परम्पराका प्राचीन मूर्तिहरू र पवित्र सामग्रीहरू छन्।" },
            fr: { text: "Le sanctuaire de Pemayangtse conserve des images anciennes et des objets sacrés de la tradition Nyingma." },
            ja: { text: "ペマヤンツェの本殿にはニンマ派の聖なる遺物や古像が安置されています。" },
            zh: { text: "白玛央则寺的大殿供奉着宁玛派的古老造像与圣物。" },
          },
          hotspots: [
            { pitch: 0, yaw: 150, type: "scene", text: "Go to Top Floor", sceneId: "top-floor" },
          ],
        },
        {
          id: "top-floor",
          title: "Top Floor - Zangdok Palri",
          image: "/pemayangtse-monastery-top-floor-wooden-model-360.jpg",
          narration: {
            en: { text: "The top floor features the exquisite wooden model of Zangdok Palri, symbolizing Guru Rinpoche’s pure land." },
            hi: { text: "शीर्ष तल पर ज़ंगडोक पलरी का सुंदर काठका नमूना है, जो गुरु रिनपोछे की शुद्ध भूमि का प्रतीक है।" },
            ne: { text: "माथिल्लो तलमा जंगडोक पल्रीको उत्कृष्ट काठको नमूना छ, गुरु रिनपोचेको शुद्ध भूमिको प्रतीक।" },
            fr: { text: "L’étage supérieur abrite le modèle en bois de Zangdok Palri, la terre pure de Gourou Rinpoché." },
            ja: { text: "最上階にはグル・リンポチェの浄土『ザンドク・パリ』の精巧な木製模型があります。" },
            zh: { text: "顶层陈列着精美的木制“桑多白利”模型，象征莲师的净土。" },
          },
          hotspots: [
            { pitch: 0, yaw: -30, type: "scene", text: "Back to Shrine Room", sceneId: "main-shrine" },
          ],
        },
      ],
    },
    audioGuide: {
      available: true,
      languages: ["English", "Hindi", "Nepali"],
      duration: "35 minutes",
    },
    visitingInfo: {
      openingHours: "7:00 AM - 5:00 PM",
      entryFee: "₹10 (Indians), ₹20 (Foreigners)",
      bestTimeToVisit: "October to December, March to May",
      accessibility: "Limited wheelchair access due to stairs",
    },
    festivals: [
      {
        name: "Guru Drakmar Chham / Cham Dance Festival",
        date: "February",
        description:
          "Traditional cham by lamas featuring Mahākāla and Guru Drag‑dmar/Vajrakilaya; marks the conclusion of Losar. The final day includes the unfurling of a large thangka and festivities.",
        sources: [
          { label: "goldentriangletour.com", url: "https://www.goldentriangletour.com/en/tourist-attractions/india/sikkim/pelling/pemayangtse-monastery-pelling.html?utm_source=chatgpt.com" },
          { label: "visittobengal.com", url: "https://www.visittobengal.com/pemayangtse-monastery-.php?utm_source=chatgpt.com" },
        ],
      },
    ],
    rating: 4.7,
    reviews: 892,
    category: "Historic Monastery",
    tags: ["Nyingma", "Mountain Views", "Historic", "Architecture"],
  },
  {
    id: "tashiding",
    name: "Tashiding Monastery",
    location: "Tashiding, West Sikkim",
    district: "West Sikkim",
    coordinates: { lat: 27.3333, lng: 88.2667 },
  description: "Sacred monastery believed to cleanse sins of those who visit with pure heart and devotion.",
  history: "Built in 1717 by Ngadak Sempa Chempo, it's considered one of the most sacred monasteries in Sikkim.",
  significance: `Tashiding is considered the most holy monastery in Sikkim. It is believed that a visit here purifies sins and brings blessings. The annual Bumchu Festival held here is a major event where lamas open a sacred vessel of holy water to predict the fortunes of the coming year. This makes it not only a religious site but also a place of prophecy and pilgrimage.`,
  founded: "1717 by Ngadak Sempa Chempo Phunshok Rigzing, a revered lama of the Nyingma tradition.",
  architecture: `Built on a sacred hilltop between the Rathong and Rangit rivers, the monastery is surrounded by dozens of ancient chortens (stupas) and prayer flags fluttering in the wind. The main shrine features murals, statues of deities, and sacred relics. Its location on the hill gives it a serene and mystical aura.`,
    images: [
      "/tashiding-monastery-sikkim-sacred-site.jpg",
      "/tashiding-monastery-hilltop-view-prayer-flags.jpg",
      "/tashiding-monastery-bumchu-ceremony.jpg",
    ],
    virtualTour: {
      available: true,
      scenes: [
        {
          id: "interior",
          title: "Main Shrine Interior",
          image: "/virtual-tour-interior.jpg",
          narration: {
            en: { text: "Inside Tashiding’s shrine, murals and sacred objects illustrate teachings and the monastery’s revered spiritual heritage." },
            hi: { text: "ताशी딩 के गर्भगृह में भित्ति-चित्र और पवित्र वस्तुएँ इसकी आध्यात्मिक परम्परा और शिक्षाओं को दर्शाती हैं।" },
            ne: { text: "ताशी्डिङको गर्भगृहभित्र भित्तेचित्र र पवित्र सामग्रीहरूले यसको आध्यात्मिक परम्परा र शिक्षाहरू झल्काउँछन्।" },
            fr: { text: "Au sanctuaire de Tashiding, fresques et objets sacrés illustrent l’héritage spirituel du monastère." },
            ja: { text: "タシディンの内陣では、壁画や聖なる法具が教えと霊的遺産を物語ります。" },
            zh: { text: "在塔希丁寺的殿内，壁画与圣物展示了其珍贵的精神传承与教义。" },
          },
          hotspots: [
            {
              pitch: 0,
              yaw: 0,
              type: "info",
              text: "Altar and sacred artifacts of Tashiding",
            },
          ],
        },
      ],
    },
    audioGuide: {
      available: true,
      languages: ["English", "Hindi", "Nepali"],
      duration: "25 minutes",
    },
    visitingInfo: {
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: "Free",
      bestTimeToVisit: "October to March",
      accessibility: "Steep climb, not suitable for mobility issues",
    },
    festivals: [
      {
        name: "Bhumchu (Bumchu) Festival",
        date: "February–March (14–15th day of 1st Tibetan lunar month)",
        description:
          "Opening of the sealed holy water vase preserved for a year. The water’s state is believed to foretell the coming year’s fortunes, and blessed water is distributed to devotees.",
        sources: [
          { label: "Utsav", url: "https://utsav.gov.in/view-event/bumchu-festival?utm_source=chatgpt.com" },
          { label: "tibetanbuddhistencyclopedia.com", url: "https://tibetanbuddhistencyclopedia.com/en/index.php/Tashiding_Monastery?utm_source=chatgpt.com" },
        ],
      },
    ],
    rating: 4.6,
    reviews: 654,
    category: "Sacred Site",
    tags: ["Sacred", "Pilgrimage", "Ceremonies", "Hiking", "Virtual Tour"],
  },
  {
    id: "enchey",
    name: "Enchey Monastery",
    location: "Gangtok",
    district: "East Sikkim",
    coordinates: { lat: 27.3333, lng: 88.6167 },
    description:
      "The solitary monastery above Gangtok, built in 1909 and offering panoramic views of the capital. Known for its spectacular Chaam dance performances.",
    history:
      "Traditionally believed to be blessed by Lama Drupthob Karpo, Enchey was rebuilt in 1909 under the rule of Sidkeong Tulku Namgyal.",
    significance:
      `Enchey is closely linked with the legends of its founder and remains a center for tantric practices. It is especially famous for the vibrant annual Chaam Dance Festival, when monks wear masks and perform ritual dances to drive away evil spirits. The monastery is a spiritual protector of Gangtok and is considered highly auspicious by locals.`,
    founded: "1909 by Lama Drupthob Karpo, a tantric master known for his ability to fly.",
  architecture: `The monastery is built in Chinese pagoda style with colorful paintings and murals depicting deities and spiritual stories. Inside are sacred images of Buddha, Lokeshwara, and Guru Padmasambhava. Around the monastery, rows of prayer wheels and fluttering flags create a spiritual atmosphere.`,
    images: [
      "/enchey-2.jpg",
      "/monastery-interior-1.jpg",
      "/monastery-exterior-mountain.jpg",
    ],
  virtualTour: { available: false },
  audioGuide: { available: true, languages: ["English", "Hindi"], duration: "10 minutes" },
    visitingInfo: {
      openingHours: "5:30 AM - 6:30 PM",
      entryFee: "Free",
      bestTimeToVisit: "October to May",
      accessibility: "Road access; some stairs inside",
    },
    festivals: [
      { name: "Chaam Dance Festival", date: "December–January", description: "Spectacular masked dances performed by monks." },
      { name: "Losar", date: "February–March", description: "Tibetan New Year celebrations." },
      { name: "Buddha Jayanti", date: "May", description: "Commemoration of Buddha's birth, enlightenment, and passing." },
      { name: "Drupka Teshi", date: "July–August", description: "Marks Buddha's first teaching at Sarnath." },
    ],
    rating: 4.5,
    reviews: 540,
    category: "Historic Monastery",
    tags: ["Nyingma", "Gangtok", "Festivals"],
  },
  {
    id: "dubdi",
    name: "Dubdi Monastery",
    location: "Yuksom",
    district: "West Sikkim",
    coordinates: { lat: 27.35, lng: 88.2333 },
    description:
      "The first monastery built in Sikkim in 1701, also known as Hermit's Cell. Holds special significance as the birthplace of Buddhism in Sikkim.",
    history:
      "Established soon after the consecration of the first Chogyal (king) of Sikkim at Yuksom by Lhatsun Namkha Jigme.",
    significance:
      `Dubdi, meaning "Retreat," is the oldest monastery in Sikkim and holds immense historical value as the birthplace of Sikkimese Buddhism. It was established after the crowning of the first king and symbolizes the spiritual foundation of Sikkim’s monarchy and Buddhist heritage. Today, it remains a quiet pilgrimage spot for those seeking solitude and history.`,
    founded: "1701 by Lhatsun Namkha Jigme, one of the three founding lamas of Sikkim, soon after the coronation of the first Chogyal at Yuksom.",
  architecture: `A small, stone-built monastery located deep in the forests near Yuksom. It features tapering stone walls, a prayer hall with ancient manuscripts, and statues of Buddhist deities. Its simplicity and seclusion embody the true essence of a hermitage.`,
    images: [
      "/monastery-exterior-mountain.jpg",
      "/mountain-with-cliff.jpg",
    ],
  virtualTour: { available: false },
  audioGuide: { available: true, languages: ["English", "Hindi"], duration: "8 minutes" },
    visitingInfo: {
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: "Free",
      bestTimeToVisit: "October to May",
      accessibility: "Short hike from Yuksom; uneven paths",
    },
    festivals: [
      { name: "Bumchu Festival", date: "February–March", description: "Holy water ritual indicating fortunes for the coming year." },
      { name: "Losar", date: "February–March", description: "Tibetan New Year celebrations." },
      { name: "Guru Rinpoche Birthday", date: "June", description: "Ceremonies honoring Padmasambhava." },
      { name: "Sacred Dance Festival", date: "Seasonal", description: "Masked dances by monks." },
    ],
    rating: 4.6,
    reviews: 320,
    category: "Historic Monastery",
    tags: ["Oldest", "Yuksom", "Pilgrimage"],
  },
  {
    id: "sangachoeling",
    name: "Sangachoeling Monastery",
    location: "Pelling",
    district: "West Sikkim",
    coordinates: { lat: 27.3083, lng: 88.2167 },
    description:
      "The second oldest monastery in Sikkim, perched at 2,100 meters offering breathtaking views of Kanchenjunga. Known for its ancient Buddhist sculptures.",
    history:
      "Founded by Lama Lhatsun Chempo in the 17th century; an important Nyingma monastery overlooking Pelling.",
    significance:
      `Sangachoeling, meaning "Island of Secret Spells," is one of the most sacred monasteries of the Nyingma sect. Its remote location made it a meditation retreat for monks. It also played an important role in spreading Buddhism across Sikkim. The monastery is visited by pilgrims as part of the sacred Buddhist pilgrimage circuit in West Sikkim.`,
  founded: `1697 by Lama Lhatsun Chempo, making it the second oldest monastery in Sikkim.`,
  architecture: `Situated on a ridge above Pelling, it is accessible only by a steep walking trail. The monastery follows traditional Tibetan style, housing clay statues of saints, ancient murals, and sacred scriptures. Surrounded by dense forests, it provides an atmosphere of seclusion and deep spirituality.`,
    images: [
      "/monastery-interior-1.jpg",
      "/monastery-exterior-mountain.jpg",
    ],
  virtualTour: { available: false },
  audioGuide: { available: true, languages: ["English", "Hindi"], duration: "9 minutes" },
    visitingInfo: {
      openingHours: "6:00 AM - 5:30 PM",
      entryFee: "Free",
      bestTimeToVisit: "October to April",
      accessibility: "Steep walking trail from Pelling",
    },
    festivals: [
      { name: "Losar", date: "February–March", description: "Tibetan New Year celebrations." },
      { name: "Saga Dawa", date: "May–June", description: "Honors Buddha's birth, enlightenment, and parinirvana." },
      { name: "Drukpa Kunley", date: "Seasonal", description: "Local festival and prayers." },
      { name: "Mahakala Festival", date: "Seasonal", description: "Protector deity ceremonies." },
    ],
    rating: 4.5,
    reviews: 410,
    category: "Historic Monastery",
    tags: ["Nyingma", "Pelling", "Views"],
  },
]

export function getMonasteryById(id: string): Monastery | undefined {
  return monasteries.find((monastery) => monastery.id === id)
}

export function getMonasteryIdByName(name: string): string | undefined {
  const slug = toSlugId(name)
  const found = monasteries.find((m) => m.id === slug || toSlugId(m.name) === slug || m.name.toLowerCase() === name.toLowerCase())
  return found?.id
}

export function getMonasteriesByDistrict(district: string): Monastery[] {
  return monasteries.filter((monastery) => monastery.district === district)
}

export function searchMonasteries(query: string): Monastery[] {
  const lowercaseQuery = query.toLowerCase()
  return monasteries.filter(
    (monastery) =>
      monastery.name.toLowerCase().includes(lowercaseQuery) ||
      monastery.location.toLowerCase().includes(lowercaseQuery) ||
      monastery.description.toLowerCase().includes(lowercaseQuery) ||
      monastery.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}
