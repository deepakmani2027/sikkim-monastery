export type ArchiveKind = "manuscript" | "thangka" | "inscription" | "mural"

export type DigitalArchiveItem = {
  id: string
  title: string
  kind: ArchiveKind
  date?: string
  origin?: string
  author?: string
  script?: string
  // Preservation condition or status
  // Supports both qualitative condition and workflow status terms
  preservation?: "original" | "restored" | "damaged" | "excellent" | "good" | "fair" | "poor"
  iiif?: string // IIIF image info.json URL
  image?: string // fallback large image url
  description?: string
  // Extended catalog fields
  materialTechnique?: string
  contents?: string
  iconography?: string
  significance?: string
  tags?: string[]
  conditionDetail?: string
}

export const digitalArchiveItems: DigitalArchiveItem[] = [
  {
    id: "rumtek-ms-001",
    title: "Rumtek Palm-Leaf Manuscript — Prajñāpāramitā",
    kind: "manuscript",
    date: "17th century",
    origin: "Rumtek Monastery",
    author: "Unknown monk",
    script: "Tibetan Uchen",
    preservation: "original",
    image: "/palm.jpeg",
    description: "High-resolution scan of a palm-leaf bundle with gilded script and marginal ornaments.",
    materialTechnique: "Palm leaves inscribed with carbon-ink Tibetan script; cord-binding through central perforations with wooden end-boards",
    contents: "Portions of the Prajñāpāramitā Sūtra (Perfection of Wisdom); possible colophons naming patrons and scribes",
    significance: "Represents the scholastic and ritual use of Mahāyāna canonical texts in Sikkim’s early monasteries",
    tags: ["Prajñāpāramitā", "palm-leaf", "Rumtek", "Tibetan Uchen", "17th century"],
    conditionDetail: "Fragile; edges worn, several folios missing or damaged; some ink fading",
  },
  {
    id: "thangka-002",
    title: "Thangka of Avalokiteśvara (Chenrezig)",
    kind: "thangka",
    date: "18th century",
    origin: "Pemayangtse Monastery",
    author: "Master painter from Nyingma school",
    script: "Traditional Tibetan thangka style; mineral pigments on cotton; fine gold highlights",
    preservation: "restored",
    image: "/thanka.jpg",
    description: "Scroll painting with intricate mandala details for deep zoom analysis.",
    materialTechnique: "Hand-painted with natural mineral pigments; mounted on textile with silk brocade frame",
    iconography: "Central image of Avalokiteśvara (Bodhisattva of Compassion) in four-armed form, surrounded by lineage masters and protective deities",
    significance: "Key ritual thangka used in Pemayangtse’s annual ceremonies, highlighting Avalokiteśvara as protector of Sikkim",
    tags: ["Avalokiteśvara", "thangka", "Pemayangtse", "compassion", "Tibetan art", "18th century"],
  },
  {
    id: "mural-011",
    title: "Temple Wall Mural — Life of Milarepa",
    kind: "mural",
    date: "18th–19th century",
    origin: "Tashiding Monastery",
    script: "Tibetan narrative painting tradition",
    preservation: "damaged",
    image: "/milarepa.jpg",
    materialTechnique: "Mineral pigments applied directly onto prepared plastered wall surface",
    contents: "Narrative scenes from the life of Milarepa — including meditation in mountain caves, discipleship under Marpa, and moments of yogic attainment",
    significance: "Provides rare visual teaching aid and spiritual inspiration; connects Sikkim’s monastic community to Kagyu lineage hagiography",
    tags: ["Milarepa", "mural", "Tashiding", "Kagyu", "Tibetan narrative art", "18th–19th century"],
    conditionDetail: "Fading and weathering due to moisture; sections chipped, but main narrative sequence still visible",
  },
  // 4) Dubdi Palm-Leaf Manuscript — Vinaya Texts
  {
    id: "dubdi-ms-vinaya-001",
    title: "Vinaya Palm-Leaf Manuscript",
    kind: "manuscript",
    date: "17th century",
    origin: "Dubdi Monastery",
    script: "Tibetan Uchen",
    preservation: "damaged",
    image: "/1.jpg",
    description: "Palm-leaf bundle with sections of Vinaya (monastic discipline); possible colophon notes with donor/scribe names.",
    materialTechnique: "Palm leaves inscribed with carbon-ink Tibetan script; cord-binding through central perforations; wooden end-boards",
    contents: "Sections of Vinaya (monastic discipline) texts; colophons with donor/scribe names possible",
    significance: "Rare early record of Vinaya transmission in Sikkim",
    tags: ["Vinaya", "palm-leaf", "Dubdi", "Tibetan Uchen", "17th century"],
    conditionDetail: "Fragile original — edges frayed, some leaves brittle and fragmented; ink fading in areas",
  },
  // 5) Sangachoeling Thangka — Guru Padmasambhava
  {
    id: "sangachoeling-thangka-guru-001",
    title: "Guru Padmasambhava Thangka",
    kind: "thangka",
    date: "18th century",
    origin: "Sangachoeling Monastery",
    script: "Tibetan Uchen (inscription on verso)",
    preservation: "restored",
    image: "/2.jpg",
    description: "Guru Padmasambhava seated in lotus posture, surrounded by Eight Manifestations and protective deities.",
    materialTechnique: "Cotton ground, mineral pigments, gold accents, brocade mountings",
    iconography: "Guru Padmasambhava with Eight Manifestations and protective deities",
    significance: "Important devotional thangka reflecting Sikkimese–Nepalese painting styles",
    conditionDetail: "Restored — consolidation of pigments, backing replaced in 20th century",
    tags: ["Padmasambhava", "thangka", "Sangachoeling", "18th century"],
  },
  // 6) Pemayangtse Wall Mural — Eight Manifestations of Guru Rinpoche
  {
    id: "pemayangtse-mural-guru-001",
    title: "Eight Manifestations Wall Mural",
    kind: "mural",
    date: "17th century",
    origin: "Pemayangtse Monastery (inner prayer hall)",
    preservation: "damaged",
    image: "/3.webp",
    description: "Depicts Eight Manifestations of Guru Rinpoche in narrative sequence with donor portraits below.",
    materialTechnique: "Mineral pigments on plaster",
    iconography: "Eight forms of Guru Rinpoche (Padmasambhava) arranged in narrative sequence with donors below",
    significance: "Pedagogical mural used for ritual and teaching; rare early Sikkimese example",
    conditionDetail: "Partially preserved — upper sections intact, lower sections damaged by water and soot",
    tags: ["mural", "Padmasambhava", "Pemayangtse", "17th century"],
  },
  // 7) Tashiding Manuscript — Kangyur (Woodblock Print)
  {
    id: "tashiding-kangyur-woodblock-001",
    title: "Kangyur Manuscript — Woodblock Print",
    kind: "manuscript",
    date: "17th century",
    origin: "Tashiding Monastery",
    script: "Tibetan Uchen",
    preservation: "excellent",
    image: "/4.webp",
    description: "Portions of the Kangyur (translated words of the Buddha).",
    materialTechnique: "Ink on handmade paper; loose folio bundles with cloth covers",
    contents: "Selections from the Kangyur",
    significance: "Shows early Sikkimese woodblock printing traditions; key reference for textual studies",
    conditionDetail: "Well-preserved — folios intact, minor edge darkening",
    tags: ["Kangyur", "woodblock print", "Tashiding", "Tibetan Uchen", "17th century"],
  },
  // 8) Enchey Thangka — Mahākāla Protector Deity
  {
    id: "enchey-thangka-mahakala-001",
    title: "Mahākāla Protector Thangka",
    kind: "thangka",
    date: "19th century",
    origin: "Enchey Monastery",
    script: "Tibetan Uchen (mantra inscriptions on reverse)",
    preservation: "restored",
    image: "/5.jpg",
    description: "Central fierce deity Mahākāla with flames and ritual implements; surrounded by subsidiary protector figures.",
    materialTechnique: "Cotton support, mineral pigments, gold highlights, brocade frame",
    iconography: "Mahākāla with multiple arms, flames, ritual implements; subsidiary protector figures",
    significance: "Ritual thangka used for protector ceremonies; strong example of late Tibetan–Sikkimese painting style",
    conditionDetail: "Restored — pigments stabilized, mounting re-stitched; minor pigment loss on lower border",
    tags: ["Mahākāla", "protector deity", "thangka", "Enchey", "19th century"],
  },
]
