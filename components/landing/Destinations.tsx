import DestinationCard from "./DestinationCard"

const destinations = [
  {
    title: "Golden Triangle Heritage",
    location: "Delhi • Agra • Jaipur",
    description: "Experience India's most iconic monuments including the Taj Mahal, Red Fort, and Amber Palace. Discover the perfect blend of Mughal and Rajput architecture.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    rating: 4.9,
    highlights: ["Taj Mahal", "Red Fort", "Amber Palace"],
    alt: "Taj Mahal reflecting in still water at sunrise with perfect symmetry"
  },
  {
    title: "Kerala Backwaters",
    location: "Alleppey • Kumarakom • Kochi",
    description: "Navigate through serene backwaters on traditional houseboats, witness lush paddy fields, and experience the authentic charm of God's Own Country.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    rating: 4.8,
    highlights: ["Houseboat Cruise", "Spice Gardens", "Ayurveda"],
    alt: "Traditional wooden houseboat floating on calm backwaters surrounded by green palm trees"
  },
  {
    title: "Himalayan Adventure",
    location: "Ladakh • Manali • Rishikesh",
    description: "Trek through the roof of the world, visit ancient monasteries, and find spiritual peace in the majestic Himalayan landscapes.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    rating: 4.7,
    highlights: ["Mountain Trekking", "Monasteries", "Adventure Sports"],
    alt: "Snow-capped Himalayan peaks with prayer flags in foreground and clear blue sky"
  },
  {
    title: "Rajasthan Desert Safari",
    location: "Jaisalmer • Jodhpur • Udaipur",
    description: "Ride camels across golden sand dunes, stay in desert camps under starlit skies, and explore magnificent palaces and forts.",
    image: "https://images.unsplash.com/photo-1477586957327-9ad3e7862be3?w=800&q=80",
    rating: 4.6,
    highlights: ["Camel Safari", "Desert Camping", "Royal Palaces"],
    alt: "Camel caravan silhouetted against orange sunset in Thar desert with sand dunes"
  },
  {
    title: "South Indian Temples",
    location: "Chennai • Madurai • Kanchipuram",
    description: "Marvel at intricately carved temple architecture, witness colorful festivals, and immerse in centuries-old spiritual traditions.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    rating: 4.8,
    highlights: ["Temple Architecture", "Cultural Festivals", "Ancient Traditions"],
    alt: "Ornate South Indian temple with detailed stone carvings and colorful painted sculptures"
  },
  {
    title: "Goa Coastal Paradise",
    location: "North Goa • South Goa • Old Goa",
    description: "Relax on pristine beaches, explore Portuguese colonial architecture, and enjoy the perfect blend of Indian and European cultures.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    rating: 4.5,
    highlights: ["Beach Paradise", "Colonial Heritage", "Vibrant Nightlife"],
    alt: "Palm trees leaning over golden beach with turquoise waters and traditional fishing boats"
  }
]

const Destinations = () => {
  return (
    <section id="destinations" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Top <span className="text-primary">Destinations</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            From ancient temples to pristine beaches, from mountain peaks to desert dunes - 
            discover the diverse landscapes and rich cultural heritage of incredible India.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div 
              key={destination.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <DestinationCard {...destination} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Destinations