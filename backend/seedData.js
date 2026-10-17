// 70 realistic plant varieties data for Bloomora Plant Nursery
const initialCategories = [
  { name: 'Indoor Plants', icon: '🌱', description: 'Thriving foliage plants that love indoor ambient conditions and indirect light' },
  { name: 'Outdoor Plants', icon: '🌿', description: 'Hardy sun-loving shrubs, hedges, and landscape plants for gardens and balconies' },
  { name: 'Air Purifiers', icon: '🍃', description: 'NASA clean air study favorites that naturally filter VOCs and elevate oxygen' },
  { name: 'Succulents & Cacti', icon: '🪴', description: 'Water-wise sculptural xerophytes with mesmerizing geometric symmetry' },
  { name: 'Flowering Plants', icon: '🌸', description: 'Lush blossoms offering vibrant color bursts, elegance, and pollinators' },
  { name: 'Indoor Trees & Palms', icon: '🌴', description: 'Majestic tall plants delivering an architectural centerpiece to any room' },
  { name: 'Hanging & Trailing', icon: '🎋', description: 'Cascading vines and weeping greenery for bookshelves and ceiling hangers' },
  { name: 'Bonsai & Topiary', icon: '🌳', description: 'Living art pieces cultivated through ancient pruning techniques' },
  { name: 'Herbs & Medicinal', icon: '🍵', description: 'Kitchen-ready culinary aromatic herbs and traditional healing flora' },
  { name: 'Ferns & Foliage', icon: '🌾', description: 'Feathery prehistoric fronds that appreciate humidity and dappled shade' }
];

const plantTemplates = [
  // 1-10: Indoor Plants
  { name: 'Monstera Deliciosa', botanical: 'Monstera deliciosa', cat: 'Indoor Plants', price: 1299, orig: 1599, stock: 25, badge: 'Bestseller', desc: 'The iconic Swiss Cheese plant featuring magnificent fenestrated leaves that thrive in bright indirect light.' },
  { name: 'ZZ Plant Raven', botanical: 'Zamioculcas zamiifolia', cat: 'Indoor Plants', price: 899, orig: 1099, stock: 30, badge: 'Low Light', desc: 'Deep glossy dark foliage with bulbous rhizomes storing water. Handles low light and occasional forgetfulness.' },
  { name: 'Aglaonema Red Siam', botanical: 'Aglaonema commutatum', cat: 'Indoor Plants', price: 649, orig: 799, stock: 22, badge: 'Colorful', desc: 'Chinese evergreen adorned with sensational crimson-pink leaf borders that illuminate dim interior corners.' },
  { name: 'Calathea Medallion', botanical: 'Goeppertia veitchiana', cat: 'Indoor Plants', price: 799, orig: 999, stock: 18, badge: 'Prayer Plant', desc: 'Intricately patterned emerald and cream leaves with rich purple undersides that gently fold up at night.' },
  { name: 'Dieffenbachia Camilla', botanical: 'Dieffenbachia seguine', cat: 'Indoor Plants', price: 549, orig: 699, stock: 24, badge: 'Easy Care', desc: 'Dumb Cane featuring creamy lime-white center blades framed by deep green leaf edges.' },
  { name: 'Philodendron Birkin', botanical: 'Philodendron hybrid', cat: 'Indoor Plants', price: 749, orig: 950, stock: 20, badge: 'Rare Find', desc: 'Distinctive compact Philodendron sporting pinstriped white variegation across glossy dark green leaves.' },
  { name: 'Syngonium White Butterfly', botanical: 'Syngonium podophyllum', cat: 'Indoor Plants', price: 399, orig: 499, stock: 35, badge: 'Popular', desc: 'Arrowhead vine with delicate silver-white center leaves that flourish into bushier foliage.' },
  { name: 'Alocasia Polly', botanical: 'Alocasia amazonica', cat: 'Indoor Plants', price: 849, orig: 1050, stock: 15, badge: 'Exotic', desc: 'African Mask plant with dramatic scalloped shield leaves and contrasting silver-white primary veins.' },
  { name: 'Cast Iron Plant', botanical: 'Aspidistra elatior', cat: 'Indoor Plants', price: 999, orig: 1299, stock: 16, badge: 'Indestructible', desc: 'Virtually indestructible heirloom houseplant tolerant of deep shade, irregular watering, and temperature swings.' },
  { name: 'Stromanthe Triostar', botanical: 'Stromanthe thalia', cat: 'Indoor Plants', price: 899, orig: 1100, stock: 14, badge: 'Collector', desc: 'Tropical masterpiece painted with brushstrokes of ivory, green, and vibrant hot-magenta undertones.' },

  // 11-20: Air Purifiers
  { name: 'Snake Plant Laurentii', botanical: 'Dracaena trifasciata', cat: 'Air Purifiers', price: 699, orig: 899, stock: 40, badge: 'Top Purifier', desc: 'Golden-edged architectural spears proven by NASA studies to convert CO2 into fresh oxygen while you sleep.' },
  { name: 'Peace Lily Symphony', botanical: 'Spathiphyllum wallisii', cat: 'Air Purifiers', price: 749, orig: 949, stock: 28, badge: 'Air Detox', desc: 'Glossy deep green foliage punctuated by graceful white spathes that scrub benzene and formaldehyde from rooms.' },
  { name: 'Spider Plant Variegated', botanical: 'Chlorophytum comosum', cat: 'Air Purifiers', price: 349, orig: 450, stock: 50, badge: 'Pet Safe', desc: 'Ribbon-like striped arching leaves producing baby plantlets on delicate runner stems.' },
  { name: 'Rubber Tree Burgundy', botanical: 'Ficus elastica', cat: 'Air Purifiers', price: 1199, orig: 1499, stock: 20, badge: 'Statement', desc: 'Stout, leathery burgundy-black ovate leaves that capture airborne toxins and add bold moody elegance.' },
  { name: 'Dracaena Marginata', botanical: 'Dracaena reflexa var. angustifolia', cat: 'Air Purifiers', price: 799, orig: 999, stock: 22, badge: 'Architectural', desc: 'Madagascar Dragon Tree sporting slender ribbons of red-trimmed foliage atop slender sculptural canes.' },
  { name: 'Areca Palm', botanical: 'Dypsis lutescens', cat: 'Air Purifiers', price: 1399, orig: 1699, stock: 18, badge: 'Humidifier', desc: 'Golden Cane Palm acting as a natural indoor humidifier while removing acetone and xylene.' },
  { name: 'Boston Fern', botanical: 'Nephrolepis exaltata', cat: 'Air Purifiers', price: 599, orig: 750, stock: 26, badge: 'Plush Fronds', desc: 'Feathery cascading lime fronds celebrated for filtering toluene and restoring clean home freshness.' },
  { name: 'Dracaena Warneckii', botanical: 'Dracaena fragrans', cat: 'Air Purifiers', price: 749, orig: 899, stock: 19, badge: 'Clean Air', desc: 'Lush sword-shaped leaves with crisp white vertical pin stripes that brighten indoor hallways.' },
  { name: 'English Ivy Glacier', botanical: 'Hedera helix', cat: 'Air Purifiers', price: 449, orig: 550, stock: 32, badge: 'Purifier', desc: 'Evergreen trailing vine with triangular variegated leaves shown to reduce airborne mold particles.' },
  { name: 'Aloe Vera Medicinal', botanical: 'Aloe barbadensis miller', cat: 'Air Purifiers', price: 399, orig: 499, stock: 45, badge: 'Healing', desc: 'Plump succulent spears packed with soothing gel that purifies air and offers immediate burn relief.' },

  // 21-30: Succulents & Cacti
  { name: 'Jade Plant Money Tree', botanical: 'Crassula ovata', cat: 'Succulents & Cacti', price: 499, orig: 649, stock: 38, badge: 'Good Luck', desc: 'Succulent bonsai symbol of prosperity with fleshy jade-green oval leaves and wood-like branching stems.' },
  { name: 'Golden Barrel Cactus', botanical: 'Echinocactus grusonii', cat: 'Succulents & Cacti', price: 899, orig: 1150, stock: 15, badge: 'Drought Hardy', desc: 'Perfect ribbed globe cactus with golden spines, ideal for sunny windowsills and xeriscape arrangements.' },
  { name: 'Echeveria Elegans', botanical: 'Echeveria elegans', cat: 'Succulents & Cacti', price: 349, orig: 450, stock: 42, badge: 'Mexican Gem', desc: 'Compact powder-blue rosette resembling an unfolded alabaster rose with pearlescent powdery farina.' },
  { name: 'Haworthia Zebra', botanical: 'Haworthiopsis attenuata', cat: 'Succulents & Cacti', price: 429, orig: 550, stock: 36, badge: 'Low Light', desc: 'Zebra succulent featuring dark triangular blades etched with raised pearl-white horizontal ribbing.' },
  { name: 'Burro’s Tail', botanical: 'Sedum morganianum', cat: 'Succulents & Cacti', price: 599, orig: 750, stock: 22, badge: 'Trailing Gem', desc: 'Dense hanging ropes of plump teardrop blue-green succulent beads spilling gracefully from hanging pots.' },
  { name: 'Moon Cactus Neon Pink', botanical: 'Gymnocalycium mihanovichii', cat: 'Succulents & Cacti', price: 399, orig: 499, stock: 28, badge: 'Vibrant', desc: 'Grafted miniature cactus bearing a glowing neon-magenta sphere crown atop a green rootstock column.' },
  { name: 'Ghost Plant', botanical: 'Graptopetalum paraguayense', cat: 'Succulents & Cacti', price: 379, orig: 499, stock: 30, badge: 'Hardy', desc: 'Pastel opalescent rosettes that change from powder blue to delicate pink blush in gentle sunlight.' },
  { name: 'Bunny Ears Cactus', botanical: 'Opuntia microdasys', cat: 'Succulents & Cacti', price: 499, orig: 650, stock: 25, badge: 'Playful', desc: 'Polka-dot cactus with paddle pads shaped like rabbit ears covered in soft golden glochid clusters.' },
  { name: 'String of Pearls', botanical: 'Senecio rowleyanus', cat: 'Succulents & Cacti', price: 649, orig: 799, stock: 17, badge: 'Iconic', desc: 'Whimsical bead-like trailing succulent strands that look like emerald pearls on a green necklace.' },
  { name: 'Agave Victoria-Reginae', botanical: 'Agave victoriae-reginae', cat: 'Succulents & Cacti', price: 1499, orig: 1899, stock: 10, badge: 'Royal Agave', desc: 'Architectural geometric succulent with compact rigid dark green leaves edged in brilliant white chalk markings.' },

  // 31-40: Flowering Plants
  { name: 'Anthurium Red Flamingo', botanical: 'Anthurium andraeanum', cat: 'Flowering Plants', price: 899, orig: 1199, stock: 24, badge: 'Long Bloom', desc: 'Heart-shaped glossy scarlet spathes that bloom continuously year-round with a yellow spadix spike.' },
  { name: 'Phalaenopsis Orchid White', botanical: 'Phalaenopsis hybrid', cat: 'Flowering Plants', price: 1599, orig: 1999, stock: 12, badge: 'Luxury', desc: 'Moth orchid featuring pristine cascading pure white blooms that stay open for up to 3 months.' },
  { name: 'African Violet Radiant', botanical: 'Saintpaulia ionantha', cat: 'Flowering Plants', price: 449, orig: 550, stock: 30, badge: 'Velvet Petals', desc: 'Fuzzy emerald rosettes crowned with cluster of intense royal purple flowers with bright golden centers.' },
  { name: 'Kalanchoe Calandiva Rose', botanical: 'Kalanchoe blossfeldiana', cat: 'Flowering Plants', price: 399, orig: 499, stock: 35, badge: 'Easy Bloom', desc: 'Thick succulent foliage capped with dense bouquets of miniature double-rose blossoms that last for weeks.' },
  { name: 'Ixora Maui Red', botanical: 'Ixora coccinea', cat: 'Flowering Plants', price: 349, orig: 450, stock: 40, badge: 'Flame of Woods', desc: 'Tropical flowering evergreen shrub bursting with spherical clusters of brilliant fiery scarlet florets.' },
  { name: 'Arabian Jasmine Mogra', botanical: 'Jasminum sambac', cat: 'Flowering Plants', price: 329, orig: 420, stock: 45, badge: 'Fragrant', desc: 'Beloved sacred Indian jasmine offering intoxicating, heavenly sweet fragrance and snow-white blossoms.' },
  { name: 'Hibiscus Brilliant Red', botanical: 'Hibiscus rosa-sinensis', cat: 'Flowering Plants', price: 399, orig: 499, stock: 32, badge: 'Tropical', desc: 'Showy, giant trumpet-shaped crimson blossoms with prominent golden stamens loved by butterflies.' },
  { name: 'Bird of Paradise Orange', botanical: 'Strelitzia reginae', cat: 'Flowering Plants', price: 1899, orig: 2400, stock: 8, badge: 'Exotic Show', desc: 'Regal crane flower exhibiting vivid orange sepals and midnight blue petals resembling an exotic bird in flight.' },
  { name: 'Adenium Desert Rose', botanical: 'Adenium obesum', cat: 'Flowering Plants', price: 1199, orig: 1499, stock: 14, badge: 'Fat Trunk', desc: 'Swollen sculptural caudex trunk topped with striking two-tone ruby and white bell blossoms.' },
  { name: 'Bougainvillea Royal Magenta', botanical: 'Bougainvillea spectabilis', cat: 'Flowering Plants', price: 499, orig: 650, stock: 26, badge: 'Sun Lover', desc: 'Spectacular cascades of paper-thin magenta bracts that thrive in full sun and heat on balconies.' },

  // 41-50: Indoor Trees & Palms
  { name: 'Fiddle Leaf Fig', botanical: 'Ficus lyrata', cat: 'Indoor Trees & Palms', price: 2499, orig: 2999, stock: 15, badge: 'Design Favorite', desc: 'Architectural tree with expansive violin-shaped textured leaves that elevates modern residential styling.' },
  { name: 'Money Tree Pachira', botanical: 'Pachira aquatica', cat: 'Indoor Trees & Palms', price: 1499, orig: 1799, stock: 20, badge: 'Braided Trunk', desc: 'Feng Shui symbol of luck featuring five-lobed green leaf umbrellas over intricately braided woody trunks.' },
  { name: 'Kentia Palm Luxury', botanical: 'Howea forsteriana', cat: 'Indoor Trees & Palms', price: 3299, orig: 3999, stock: 6, badge: 'Grand Palm', desc: 'The quintessential Victorian luxury palm with slender arching dark green fronds and slow, stately growth.' },
  { name: 'Ficus Audrey', botanical: 'Ficus benghalensis', cat: 'Indoor Trees & Palms', price: 2199, orig: 2699, stock: 11, badge: 'Velvet Tree', desc: 'India’s sacred national banyan species with thick velvety leaves, striking pale veins, and smooth white trunk.' },
  { name: 'Majesty Palm', botanical: 'Ravenea rivularis', cat: 'Indoor Trees & Palms', price: 1699, orig: 2099, stock: 14, badge: 'Tropical Vibe', desc: 'Symmetrical tropical feather palm that brings instant oasis ambiance to high-ceiling living rooms.' },
  { name: 'Parlor Palm Neanthe Bella', botanical: 'Chamaedorea elegans', cat: 'Indoor Trees & Palms', price: 699, orig: 899, stock: 25, badge: 'Compact Palm', desc: 'Beloved Victorian table palm thriving in dim rooms with clump-forming feathery fronds.' },
  { name: 'Umbrella Tree Schefflera', botanical: 'Heptapleurum arboricola', cat: 'Indoor Trees & Palms', price: 999, orig: 1299, stock: 18, badge: 'Lush Foliage', desc: 'Glossy palmate leaflets arranged in spokes of 7-9 radiating outward like delightful botanical parasols.' },
  { name: 'Yucca Cane Sturdy', botanical: 'Yucca elephantipes', cat: 'Indoor Trees & Palms', price: 1299, orig: 1599, stock: 16, badge: 'Drought Hardy', desc: 'Thick woody trunks capped with bursts of stiff sword-shaped emerald green foliage.' },
  { name: 'Norfolk Island Pine', botanical: 'Araucaria heterophylla', cat: 'Indoor Trees & Palms', price: 1399, orig: 1699, stock: 12, badge: 'Living Conifer', desc: 'Graceful tiered pyramidal living evergreen with soft feathery needle branches suitable for year-round indoor joy.' },
  { name: 'Ponytail Palm Elephant Foot', botanical: 'Beaucarnea recurvata', cat: 'Indoor Trees & Palms', price: 1199, orig: 1499, stock: 17, badge: 'Caudex Tree', desc: 'Bulbous swollen base holding water with a fountain of long curling ribbon leaves cascading down.' },

  // 51-60: Hanging & Trailing Plants
  { name: 'Golden Pothos Devil’s Ivy', botanical: 'Epipremnum aureum', cat: 'Hanging & Trailing', price: 499, orig: 599, stock: 40, badge: 'Beginner Safe', desc: 'Vigorous trailing heart-leaf vine splashed with gold variegation. Roots effortlessly in water or soil.' },
  { name: 'Satin Pothos Silver Splash', botanical: 'Scindapsus pictus', cat: 'Hanging & Trailing', price: 649, orig: 799, stock: 24, badge: 'Silvery Sheen', desc: 'Velvety matte heart leaves sprinkled with shimmering sterling-silver splashes that catch sunlight.' },
  { name: 'Heartleaf Philodendron', botanical: 'Philodendron hederaceum', cat: 'Hanging & Trailing', price: 450, orig: 550, stock: 35, badge: 'Sweetheart', desc: 'Classic cascade of romantic heart-shaped glossy foliage that gently climbs or trails gracefully.' },
  { name: 'String of Hearts', botanical: 'Ceropegia woodii', cat: 'Hanging & Trailing', price: 799, orig: 999, stock: 18, badge: 'Delicate Vine', desc: 'Thread-like purple stems dotted with silver-marbled succulent hearts and unique lantern-shaped blooms.' },
  { name: 'Tradescantia Zebrina', botanical: 'Tradescantia zebrina', cat: 'Hanging & Trailing', price: 379, orig: 480, stock: 38, badge: 'Purple Wonder', desc: 'Fast-growing wandering vine showing striped silver-glitter leaves with luminous magenta-violet underbellies.' },
  { name: 'Hoya Carnosa Wax Plant', botanical: 'Hoya carnosa', cat: 'Hanging & Trailing', price: 899, orig: 1100, stock: 16, badge: 'Porcelain Bloom', desc: 'Leathery waxy foliage climbing or spilling with clusters of heavenly sweet porcelain star blossoms.' },
  { name: 'Monstera Adansonii Monkey Mask', botanical: 'Monstera adansonii', cat: 'Hanging & Trailing', price: 699, orig: 899, stock: 25, badge: 'Jungle Vine', desc: 'Swiss Cheese vine with oval leaves perforated with delicate natural windows that climb or drape.' },
  { name: 'String of Turtles', botanical: 'Peperomia prostrata', cat: 'Hanging & Trailing', price: 849, orig: 1050, stock: 15, badge: 'Collector Vine', desc: 'Miniature succulent vine featuring round leaves resembling intricate dark green sea turtle shells.' },
  { name: 'Marble Queen Pothos', botanical: 'Epipremnum aureum Marble', cat: 'Hanging & Trailing', price: 549, orig: 699, stock: 30, badge: 'White Marble', desc: 'Striking heavy cream and green marbling across lush heart leaves that love bright indirect spaces.' },
  { name: 'Dischidia Oiantha', botanical: 'Dischidia oiantha', cat: 'Hanging & Trailing', price: 699, orig: 850, stock: 20, badge: 'Epiphyte', desc: 'Charming trailing epiphyte with coin-like silvery grey-green leaves forming neat dense garlands.' },

  // 61-70: Outdoor, Bonsai & Herbs
  { name: 'Ficus Ginseng Bonsai', botanical: 'Ficus microcarpa', cat: 'Bonsai & Topiary', price: 1899, orig: 2299, stock: 14, badge: 'Ancient Form', desc: 'Stunning exposed thick aerial banyan roots trained into a dramatic living sculpture with compact canopy.' },
  { name: 'Chinese Elm Bonsai', botanical: 'Ulmus parvifolia', cat: 'Bonsai & Topiary', price: 2499, orig: 2999, stock: 9, badge: 'Traditional', desc: 'Fine delicate twigging and tiny serrated leaves creating the authentic silhouette of an ancient century-old oak.' },
  { name: 'Holy Basil Krishna Tulsi', botanical: 'Ocimum tenuiflorum', cat: 'Herbs & Medicinal', price: 249, orig: 320, stock: 60, badge: 'Sacred Herb', desc: 'Revered spiritual Ayurvedic holy basil packed with potent adaptogenic properties and spicy aromatic fragrance.' },
  { name: 'Sweet Italian Basil', botanical: 'Ocimum basilicum', cat: 'Herbs & Medicinal', price: 229, orig: 299, stock: 50, badge: 'Kitchen Garden', desc: 'Lush tender sweet culinary basil leaves essential for pestos, fresh garden salads, and gourmet pastas.' },
  { name: 'Rosemary Tuscan Blue', botanical: 'Salvia rosmarinus', cat: 'Herbs & Medicinal', price: 349, orig: 450, stock: 35, badge: 'Aromatic', desc: 'Evergreen needle herb containing rich pine-camphor essential oils and dainty lavender-blue spring blossoms.' },
  { name: 'Spearmint Pudina Desi', botanical: 'Mentha spicata', cat: 'Herbs & Medicinal', price: 199, orig: 260, stock: 55, badge: 'Refreshing', desc: 'Vigorous zesty garden mint indispensable for cooling summer drinks, chutneys, and soothing teas.' },
  { name: 'Croton Petra Rainbow', botanical: 'Codiaeum variegatum', cat: 'Outdoor Plants', price: 449, orig: 599, stock: 32, badge: 'Kaleidoscope', desc: 'Fiery foliage shrub painted with blazing veins of sunshine yellow, amber orange, and crimson red.' },
  { name: 'Ixora Coccinea Rugmini', botanical: 'Ixora chinensis', cat: 'Outdoor Plants', price: 349, orig: 450, stock: 40, badge: 'Butterfly Haven', desc: 'Hardy perennial garden shrub producing dense pom-pom heads of bright coral blossoms year round.' },
  { name: 'Bird’s Nest Fern Leslie', botanical: 'Asplenium nidus', cat: 'Ferns & Foliage', price: 699, orig: 899, stock: 22, badge: 'Tropical Fronds', desc: 'Rosette of wavy bright apple-green crinkled fronds emerging from a central fuzzy nest core.' },
  { name: 'Staghorn Fern Platycerium', botanical: 'Platycerium bifurcatum', cat: 'Ferns & Foliage', price: 1299, orig: 1599, stock: 12, badge: 'Living Art', desc: 'Prehistoric architectural fern displaying antler-shaped silvery fertile fronds ready to mount on boards.' }
];

module.exports = { initialCategories, plantTemplates };
