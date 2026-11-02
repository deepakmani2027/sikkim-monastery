export type ArchiveItem = {
  id: string
  title: string
  type: "Manuscript" | "Mural" | "Photo" | "Document"
  century: string
  monastery: string
  language: string
  material: string
  status: "Excellent" | "Good" | "Fair"
  image: string
  description: string
  dimensions?: string
  dateAcquired?: string
}

export const archiveItems: ArchiveItem[] = [
  {
    id: "lotus-sutra",
    title: "Lotus Sutra Manuscript",
    type: "Manuscript",
    century: "17th Century",
    monastery: "Rumtek Monastery",
    language: "Classical Tibetan",
    material: "Handmade paper, gold ink",
    status: "Excellent",
    image: "/main-image.jpeg",
    description:
      "Ancient Tibetan manuscript of the Lotus Sutra written on handmade paper with gold ink illuminations, representing one of the most important Buddhist texts.",
    dimensions: "42 × 8 cm (folio)",
    dateAcquired: "1898-04-12",
  },
  {
    id: "buddha-life-mural",
    title: "Buddha Life Murals",
    type: "Mural",
    century: "18th Century",
    monastery: "Pemayangtse Monastery",
    language: "Visual Art",
    material: "Natural pigments on wall",
    status: "Good",
    image: "/unnamed.jpg",
    description:
      "Intricate wall paintings depicting the life of Buddha from birth to enlightenment, showcasing traditional Tibetan artistic techniques.",
    dimensions: "300 × 150 cm",
    dateAcquired: "2001-07-22",
  },
  {
    id: "sacred-thangka-ralang",
    title: "Sacred Thangka Painting",
    type: "Photo",
    century: "18th Century",
    monastery: "Ralang Monastery",
    language: "Visual Art (Symbolic Buddhist Iconography)",
    material: "Cotton canvas, natural mineral pigments, gold leaf",
    status: "Good",
    image: "/xyz.jpg",
    description:
      "Elaborate hand-painted Thangka depicting Buddhist deities and cosmic mandalas, traditionally used for meditation and spiritual teaching. Preserved as a cultural treasure of Ralang Monastery.",
  },
  {
    id: "ritual-prayer",
    title: "Ritual Prayer Instructions",
    type: "Document",
    century: "19th Century",
    monastery: "Enchey Monastery",
    language: "Tibetan, Nepali",
    material: "Handmade paper",
    status: "Good",
    image: "/enchey-2.jpg",
    description:
      "Detailed instructions for conducting daily prayers and seasonal festivals, including proper pronunciations and ritual procedures.",
  },
  {
    id: "sacred-mandala",
    title: "Sacred Mandala Thangka",
    type: "Photo",
    century: "17th Century",
    monastery: "Dubdi Monastery",
    language: "Visual Art",
    material: "Silk, natural pigments",
    status: "Excellent",
    image: "/mandala_thangka_1_Thangka_Store_1024x1024.webp",
    description:
      "Sacred thangka painting depicting an intricate Buddhist mandala with geometric patterns representing the universe and spiritual path.",
  },
  {
    id: "chanting-manuscript",
    title: "Chanting Manuscript",
    type: "Manuscript",
    century: "18th Century",
    monastery: "Rumtek Monastery",
    language: "Sanskrit, Tibetan",
    material: "Palm leaf, iron ink",
    status: "Good",
    image: "/pqr.jpg",
    description:
      "Musical notation and lyrics for traditional Buddhist chants and prayers, preserving ancient vocal traditions.",
  },
]
