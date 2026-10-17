const mongoose = require('mongoose');
const Plant = require('./models/plantmodel');

const resolvePlantImage = (categoryName, plantName) => {
  const name = (plantName || '').toLowerCase();
  if (name.includes('monstera')) return '/images/plant-monstera.jpg';
  if (name.includes('fiddle') || name.includes('lyrata')) return '/images/plant-fiddle.jpg';
  if (name.includes('snake') || name.includes('sansevieria')) return '/images/plant-snake.jpg';
  if (name.includes('peace lily')) return '/images/plant-peacelily.jpg';
  if (name.includes('bonsai') || name.includes('elm')) return '/images/plant-bonsai.jpg';
  if (name.includes('orchid') || name.includes('anthurium') || name.includes('jasmine') || name.includes('hibiscus') || name.includes('florets') || name.includes('rose') || name.includes('violet') || name.includes('ixora') || name.includes('bougainvillea')) return '/images/plant-flowering.jpg';
  if (name.includes('fern')) return '/images/plant-fern.jpg';
  if (name.includes('tulsi') || name.includes('basil') || name.includes('mint') || name.includes('pudina') || name.includes('rosemary') || name.includes('herb')) return '/images/plant-herbs.jpg';
  if (name.includes('palm') || name.includes('tree') || name.includes('pine') || name.includes('yucca') || name.includes('schefflera')) return '/images/plant-palm.jpg';
  if (name.includes('pothos') || name.includes('ivy') || name.includes('trailing') || name.includes('heart') || name.includes('turtle') || name.includes('dischidia') || name.includes('hoya') || name.includes('tradescantia')) return '/images/plant-pothos.jpg';
  if (name.includes('succulent') || name.includes('cactus') || name.includes('echeveria') || name.includes('aloe') || name.includes('jade') || name.includes('haworthia') || name.includes('agave') || name.includes('sedum')) return '/images/plant-succulent.jpg';

  switch (categoryName) {
    case 'Indoor Plants': return '/images/plant-monstera.jpg';
    case 'Outdoor Plants': return '/images/plant-fiddle.jpg';
    case 'Air Purifiers': return '/images/plant-peacelily.jpg';
    case 'Succulents & Cacti': return '/images/plant-succulent.jpg';
    case 'Flowering Plants': return '/images/plant-flowering.jpg';
    case 'Indoor Trees & Palms': return '/images/plant-palm.jpg';
    case 'Hanging & Trailing': return '/images/plant-pothos.jpg';
    case 'Bonsai & Topiary': return '/images/plant-bonsai.jpg';
    case 'Herbs & Medicinal': return '/images/plant-herbs.jpg';
    case 'Ferns & Foliage': return '/images/plant-fern.jpg';
    default: return '/images/plant-monstera.jpg';
  }
};

async function run() {
  await mongoose.connect('mongodb://localhost:27017/plantnursery');
  const allPlants = await Plant.find();
  for (const p of allPlants) {
    p.image = resolvePlantImage(p.categoryName, p.plantName);
    await p.save();
  }
  console.log(`ALIGNED_SUCCESS: ${allPlants.length} plants updated!`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
