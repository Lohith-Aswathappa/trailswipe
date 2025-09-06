// 100 Sample trails around San Francisco and Bay Area
export const sampleTrails: Array<{
  name: string;
  description: string;
  distance: number;
  elevation: number;
  difficulty: string;
  tags: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}> = [
  // San Francisco Trails (1-20)
  {
    name: 'Golden Gate Park Loop',
    description: 'A beautiful loop through Golden Gate Park with scenic views',
    distance: 3.2,
    elevation: 150,
    difficulty: 'easy',
    tags: ['scenic', 'family-friendly', 'paved'],
    location: { type: 'Point' as const, coordinates: [-122.4615, 37.7694] as [number, number] as [number, number] }
  },
  {
    name: 'Mount Davidson Trail',
    description: 'Steep climb to the highest point in San Francisco',
    distance: 2.1,
    elevation: 928,
    difficulty: 'moderate',
    tags: ['scenic', 'challenging', 'views'],
    location: { type: 'Point' as const, coordinates: [-122.4567, 37.7519] }
  },
  {
    name: 'Lands End Coastal Trail',
    description: 'Coastal trail with ocean views and historic sites',
    distance: 4.5,
    elevation: 200,
    difficulty: 'easy',
    tags: ['coastal', 'scenic', 'historic'],
    location: { type: 'Point' as const, coordinates: [-122.5118, 37.7849] }
  },
  {
    name: 'Twin Peaks Summit',
    description: 'Challenging hike to the iconic Twin Peaks',
    distance: 1.8,
    elevation: 922,
    difficulty: 'moderate',
    tags: ['challenging', 'views', 'urban'],
    location: { type: 'Point' as const, coordinates: [-122.4474, 37.7516] }
  },
  {
    name: 'Presidio Trails',
    description: 'Network of trails through the historic Presidio',
    distance: 4.8,
    elevation: 300,
    difficulty: 'moderate',
    tags: ['historic', 'forest', 'family-friendly'],
    location: { type: 'Point' as const, coordinates: [-122.4662, 37.7989] }
  },
  {
    name: 'Sutro Heights Park',
    description: 'Historic park with ocean views and easy walking paths',
    distance: 1.2,
    elevation: 80,
    difficulty: 'easy',
    tags: ['historic', 'ocean-views', 'family-friendly'],
    location: { type: 'Point' as const, coordinates: [-122.5089, 37.7803] }
  },
  {
    name: 'Glen Canyon Park',
    description: 'Hidden gem with natural trails and rock formations',
    distance: 2.5,
    elevation: 200,
    difficulty: 'moderate',
    tags: ['natural', 'rocky', 'hidden-gem'],
    location: { type: 'Point' as const, coordinates: [-122.4447, 37.7419] }
  },
  {
    name: 'Corona Heights Park',
    description: 'Short but steep climb with panoramic city views',
    distance: 0.8,
    elevation: 200,
    difficulty: 'moderate',
    tags: ['city-views', 'steep', 'short'],
    location: { type: 'Point' as const, coordinates: [-122.4378, 37.7619] }
  },
  {
    name: 'Buena Vista Park',
    description: 'Historic park with winding trails and city views',
    distance: 1.5,
    elevation: 150,
    difficulty: 'easy',
    tags: ['historic', 'city-views', 'family-friendly'],
    location: { type: 'Point' as const, coordinates: [-122.4397, 37.7689] }
  },
  {
    name: 'Dolores Park Loop',
    description: 'Popular park with gentle slopes and great people watching',
    distance: 1.0,
    elevation: 50,
    difficulty: 'easy',
    tags: ['social', 'family-friendly', 'urban'],
    location: { type: 'Point' as const, coordinates: [-122.4267, 37.7597] }
  },
  {
    name: 'Bernal Heights Park',
    description: 'Steep climb to one of the best city viewpoints',
    distance: 1.2,
    elevation: 300,
    difficulty: 'moderate',
    tags: ['city-views', 'steep', 'panoramic'],
    location: { type: 'Point' as const, coordinates: [-122.4156, 37.7442] }
  },
  {
    name: 'McLaren Park',
    description: 'Large park with diverse trails and wildlife',
    distance: 3.5,
    elevation: 250,
    difficulty: 'moderate',
    tags: ['wildlife', 'diverse', 'large-park'],
    location: { type: 'Point' as const, coordinates: [-122.4206, 37.7289] }
  },
  {
    name: 'Stern Grove',
    description: 'Natural amphitheater with forest trails',
    distance: 2.0,
    elevation: 100,
    difficulty: 'easy',
    tags: ['forest', 'natural', 'amphitheater'],
    location: { type: 'Point' as const, coordinates: [-122.4639, 37.7697] }
  },
  {
    name: 'Glen Park Canyon',
    description: 'Wild canyon feel within the city limits',
    distance: 2.8,
    elevation: 300,
    difficulty: 'moderate',
    tags: ['canyon', 'wild', 'natural'],
    location: { type: 'Point' as const, coordinates: [-122.4447, 37.7419] }
  },
  {
    name: 'Fort Funston',
    description: 'Coastal bluffs with hang gliding and dog-friendly trails',
    distance: 2.2,
    elevation: 150,
    difficulty: 'easy',
    tags: ['coastal', 'dog-friendly', 'hang-gliding'],
    location: { type: 'Point' as const, coordinates: [-122.5028, 37.7197] }
  },
  {
    name: 'Ocean Beach Walk',
    description: 'Long beach walk with ocean sounds and sunset views',
    distance: 3.5,
    elevation: 10,
    difficulty: 'easy',
    tags: ['beach', 'ocean', 'sunset'],
    location: { type: 'Point' as const, coordinates: [-122.5089, 37.7597] }
  },
  {
    name: 'Crissy Field',
    description: 'Flat waterfront trail with Golden Gate Bridge views',
    distance: 2.0,
    elevation: 5,
    difficulty: 'easy',
    tags: ['waterfront', 'bridge-views', 'flat'],
    location: { type: 'Point' as const, coordinates: [-122.4667, 37.8028] }
  },
  {
    name: 'Baker Beach Trail',
    description: 'Beach trail with dramatic coastal views',
    distance: 1.5,
    elevation: 50,
    difficulty: 'easy',
    tags: ['beach', 'coastal', 'dramatic-views'],
    location: { type: 'Point' as const, coordinates: [-122.4839, 37.7942] }
  },
  {
    name: 'Lombard Street Steps',
    description: 'Famous crooked street with steep stair climbs',
    distance: 0.3,
    elevation: 100,
    difficulty: 'moderate',
    tags: ['famous', 'stairs', 'steep'],
    location: { type: 'Point' as const, coordinates: [-122.4189, 37.8022] }
  },
  {
    name: 'Coit Tower Trail',
    description: 'Steep climb to the iconic Coit Tower',
    distance: 0.8,
    elevation: 200,
    difficulty: 'moderate',
    tags: ['iconic', 'steep', 'tower'],
    location: { type: 'Point' as const, coordinates: [-122.4058, 37.8025] }
  },

  // Marin County Trails (21-40)
  {
    name: 'Muir Woods National Monument',
    description: 'Famous redwood grove with easy boardwalk trails',
    distance: 2.0,
    elevation: 100,
    difficulty: 'easy',
    tags: ['redwoods', 'famous', 'boardwalk'],
    location: { type: 'Point' as const, coordinates: [-122.5814, 37.8958] }
  },
  {
    name: 'Mount Tamalpais East Peak',
    description: 'Challenging climb to the highest point in Marin',
    distance: 6.5,
    elevation: 2571,
    difficulty: 'hard',
    tags: ['challenging', 'summit', 'views'],
    location: { type: 'Point' as const, coordinates: [-122.5964, 37.9236] }
  },
  {
    name: 'Stinson Beach to Mount Tam',
    description: 'Epic coastal to mountain trail with diverse terrain',
    distance: 8.2,
    elevation: 2000,
    difficulty: 'hard',
    tags: ['epic', 'coastal', 'mountain'],
    location: { type: 'Point' as const, coordinates: [-122.6447, 37.9008] }
  },
  {
    name: 'Dipsea Trail',
    description: 'Historic trail from Mill Valley to Stinson Beach',
    distance: 7.4,
    elevation: 2200,
    difficulty: 'hard',
    tags: ['historic', 'challenging', 'coastal'],
    location: { type: 'Point' as const, coordinates: [-122.5447, 37.9069] }
  },
  {
    name: 'Steep Ravine Trail',
    description: 'Beautiful canyon trail with waterfalls and redwoods',
    distance: 3.5,
    elevation: 800,
    difficulty: 'moderate',
    tags: ['waterfalls', 'redwoods', 'canyon'],
    location: { type: 'Point' as const, coordinates: [-122.5964, 37.9069] }
  },
  {
    name: 'Matt Davis Trail',
    description: 'Scenic trail with ocean views and wildflowers',
    distance: 4.2,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['ocean-views', 'wildflowers', 'scenic'],
    location: { type: 'Point' as const, coordinates: [-122.6447, 37.9069] }
  },
  {
    name: 'Phoenix Lake Loop',
    description: 'Easy loop around a peaceful lake',
    distance: 2.8,
    elevation: 200,
    difficulty: 'easy',
    tags: ['lake', 'peaceful', 'family-friendly'],
    location: { type: 'Point' as const, coordinates: [-122.5447, 37.9569] }
  },
  {
    name: 'Cascade Falls Trail',
    description: 'Short trail to a beautiful waterfall',
    distance: 1.5,
    elevation: 300,
    difficulty: 'moderate',
    tags: ['waterfall', 'short', 'beautiful'],
    location: { type: 'Point' as const, coordinates: [-122.5964, 37.9569] }
  },
  {
    name: 'Tennessee Valley Trail',
    description: 'Easy coastal trail to a hidden beach',
    distance: 3.4,
    elevation: 200,
    difficulty: 'easy',
    tags: ['coastal', 'beach', 'easy'],
    location: { type: 'Point' as const, coordinates: [-122.5447, 37.8569] }
  },
  {
    name: 'Rodeo Beach Loop',
    description: 'Coastal loop with dramatic cliffs and ocean views',
    distance: 2.5,
    elevation: 150,
    difficulty: 'easy',
    tags: ['coastal', 'cliffs', 'ocean-views'],
    location: { type: 'Point' as const, coordinates: [-122.5447, 37.8269] }
  },
  {
    name: 'Alpine Lake Trail',
    description: 'Mountain lake with fishing and swimming',
    distance: 4.0,
    elevation: 400,
    difficulty: 'moderate',
    tags: ['lake', 'fishing', 'swimming'],
    location: { type: 'Point' as const, coordinates: [-122.5964, 37.9569] }
  },
  {
    name: 'Cataract Falls Trail',
    description: 'Waterfall trail through lush forest',
    distance: 3.0,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['waterfalls', 'forest', 'lush'],
    location: { type: 'Point' as const, coordinates: [-122.5964, 37.9569] }
  },
  {
    name: 'Bolinas Ridge Trail',
    description: 'Ridge trail with panoramic views of the coast',
    distance: 5.5,
    elevation: 800,
    difficulty: 'moderate',
    tags: ['ridge', 'panoramic', 'coastal-views'],
    location: { type: 'Point' as const, coordinates: [-122.6447, 37.9069] }
  },
  {
    name: 'Loma Alta Trail',
    description: 'Open space trail with wildflowers and views',
    distance: 3.8,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['wildflowers', 'open-space', 'views'],
    location: { type: 'Point' as const, coordinates: [-122.5447, 37.9569] }
  },
  {
    name: 'Ring Mountain Preserve',
    description: 'Unique geological formations and rare plants',
    distance: 2.5,
    elevation: 300,
    difficulty: 'easy',
    tags: ['geological', 'rare-plants', 'unique'],
    location: { type: 'Point' as const, coordinates: [-122.5447, 37.9069] }
  },
  {
    name: 'China Camp State Park',
    description: 'Historic Chinese fishing village with bay views',
    distance: 4.0,
    elevation: 200,
    difficulty: 'easy',
    tags: ['historic', 'bay-views', 'fishing-village'],
    location: { type: 'Point' as const, coordinates: [-122.4964, 38.0069] }
  },
  {
    name: 'Mount Burdell Trail',
    description: 'Oak woodland trail with spring wildflowers',
    distance: 6.0,
    elevation: 1000,
    difficulty: 'moderate',
    tags: ['oak-woodland', 'wildflowers', 'spring'],
    location: { type: 'Point' as const, coordinates: [-122.5964, 38.1069] }
  },
  {
    name: 'Rush Creek Open Space',
    description: 'Wetland preserve with bird watching opportunities',
    distance: 2.0,
    elevation: 50,
    difficulty: 'easy',
    tags: ['wetland', 'bird-watching', 'preserve'],
    location: { type: 'Point' as const, coordinates: [-122.4964, 38.0069] }
  },

  // East Bay Trails (41-60)
  {
    name: 'Tilden Regional Park',
    description: 'Large park with diverse trails and a steam train',
    distance: 5.0,
    elevation: 400,
    difficulty: 'moderate',
    tags: ['diverse', 'steam-train', 'large-park'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.9069] }
  },
  {
    name: 'Mount Diablo Summit',
    description: 'Challenging climb to the highest peak in the East Bay',
    distance: 7.0,
    elevation: 3849,
    difficulty: 'hard',
    tags: ['summit', 'challenging', 'highest-peak'],
    location: { type: 'Point' as const, coordinates: [-121.9147, 37.8814] }
  },
  {
    name: 'Redwood Regional Park',
    description: 'Redwood groves in the East Bay hills',
    distance: 4.5,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['redwoods', 'hills', 'east-bay'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.8069] }
  },
  {
    name: 'Sibley Volcanic Regional Preserve',
    description: 'Unique volcanic landscape with interpretive trails',
    distance: 3.0,
    elevation: 300,
    difficulty: 'easy',
    tags: ['volcanic', 'interpretive', 'unique'],
    location: { type: 'Point' as const, coordinates: [-122.1964, 37.8569] }
  },
  {
    name: 'Chabot Space & Science Center Trails',
    description: 'Easy trails near the science center with city views',
    distance: 2.5,
    elevation: 200,
    difficulty: 'easy',
    tags: ['science-center', 'city-views', 'easy'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.8069] }
  },
  {
    name: 'Anthony Chabot Regional Park',
    description: 'Large park with lake and diverse hiking trails',
    distance: 6.0,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['lake', 'diverse', 'large-park'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.7569] }
  },
  {
    name: 'Claremont Canyon Regional Preserve',
    description: 'Steep canyon trail with panoramic bay views',
    distance: 2.5,
    elevation: 800,
    difficulty: 'moderate',
    tags: ['canyon', 'steep', 'bay-views'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.8569] }
  },
  {
    name: 'Grizzly Peak Trail',
    description: 'Ridge trail with spectacular bay and city views',
    distance: 4.0,
    elevation: 700,
    difficulty: 'moderate',
    tags: ['ridge', 'bay-views', 'city-views'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.8569] }
  },
  {
    name: 'Wildcat Canyon Regional Park',
    description: 'Open grasslands with rolling hills and wildlife',
    distance: 5.5,
    elevation: 400,
    difficulty: 'moderate',
    tags: ['grasslands', 'wildlife', 'rolling-hills'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.9069] }
  },
  {
    name: 'Temescal Regional Recreation Area',
    description: 'Lake with swimming and easy walking trails',
    distance: 2.0,
    elevation: 100,
    difficulty: 'easy',
    tags: ['lake', 'swimming', 'easy'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.8569] }
  },
  {
    name: 'Huckleberry Botanic Regional Preserve',
    description: 'Rare plant preserve with interpretive nature trail',
    distance: 1.5,
    elevation: 200,
    difficulty: 'easy',
    tags: ['rare-plants', 'interpretive', 'nature'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.8569] }
  },
  {
    name: 'Sobrante Ridge Regional Preserve',
    description: 'Open space with grassland and oak woodland',
    distance: 3.5,
    elevation: 300,
    difficulty: 'moderate',
    tags: ['grassland', 'oak-woodland', 'open-space'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.9069] }
  },
  {
    name: 'Briones Regional Park',
    description: 'Large park with rolling hills and cattle grazing',
    distance: 8.0,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['rolling-hills', 'cattle', 'large-park'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.9069] }
  },
  {
    name: 'Las Trampas Regional Wilderness',
    description: 'Rugged wilderness area with steep trails',
    distance: 6.5,
    elevation: 1000,
    difficulty: 'hard',
    tags: ['wilderness', 'rugged', 'steep'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.8069] }
  },
  {
    name: 'Mount Wanda',
    description: 'Easy trail with views of Mount Diablo',
    distance: 2.0,
    elevation: 200,
    difficulty: 'easy',
    tags: ['easy', 'mount-diablo-views', 'family-friendly'],
    location: { type: 'Point' as const, coordinates: [-121.9147, 37.8814] }
  },
  {
    name: 'Shell Ridge Open Space',
    description: 'Open space with grassland and oak trees',
    distance: 4.0,
    elevation: 400,
    difficulty: 'moderate',
    tags: ['grassland', 'oak-trees', 'open-space'],
    location: { type: 'Point' as const, coordinates: [-121.9147, 37.8814] }
  },
  {
    name: 'Lafayette Reservoir',
    description: 'Popular lake with paved walking path',
    distance: 2.7,
    elevation: 50,
    difficulty: 'easy',
    tags: ['lake', 'paved', 'popular'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.8569] }
  },
  {
    name: 'Coyote Hills Regional Park',
    description: 'Wetland preserve with bay views and wildlife',
    distance: 3.5,
    elevation: 100,
    difficulty: 'easy',
    tags: ['wetland', 'bay-views', 'wildlife'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.5569] }
  },
  {
    name: 'Sunol Regional Wilderness',
    description: 'Wilderness area with Little Yosemite and waterfalls',
    distance: 5.0,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['wilderness', 'waterfalls', 'little-yosemite'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.6069] }
  },

  // Peninsula Trails (61-80)
  {
    name: 'Crystal Springs Reservoir',
    description: 'Paved trail around a beautiful reservoir',
    distance: 6.0,
    elevation: 100,
    difficulty: 'easy',
    tags: ['reservoir', 'paved', 'beautiful'],
    location: { type: 'Point' as const, coordinates: [-122.3564, 37.5069] }
  },
  {
    name: 'Sawyer Camp Trail',
    description: 'Popular paved trail with reservoir views',
    distance: 6.0,
    elevation: 50,
    difficulty: 'easy',
    tags: ['popular', 'paved', 'reservoir-views'],
    location: { type: 'Point' as const, coordinates: [-122.3564, 37.5069] }
  },
  {
    name: 'Montara Mountain',
    description: 'Coastal mountain with ocean and bay views',
    distance: 4.5,
    elevation: 1200,
    difficulty: 'moderate',
    tags: ['coastal-mountain', 'ocean-views', 'bay-views'],
    location: { type: 'Point' as const, coordinates: [-122.4564, 37.5569] }
  },
  {
    name: 'San Pedro Valley Park',
    description: 'Coastal park with beach access and trails',
    distance: 3.0,
    elevation: 200,
    difficulty: 'easy',
    tags: ['coastal', 'beach-access', 'easy'],
    location: { type: 'Point' as const, coordinates: [-122.4564, 37.5569] }
  },
  {
    name: 'Pacifica Pier to Mori Point',
    description: 'Coastal trail with dramatic cliffs and ocean views',
    distance: 2.5,
    elevation: 150,
    difficulty: 'easy',
    tags: ['coastal', 'cliffs', 'ocean-views'],
    location: { type: 'Point' as const, coordinates: [-122.4564, 37.6069] }
  },
  {
    name: 'Sweeney Ridge',
    description: 'Historic trail where the Pacific was first sighted',
    distance: 4.0,
    elevation: 400,
    difficulty: 'moderate',
    tags: ['historic', 'pacific-sighting', 'ridge'],
    location: { type: 'Point' as const, coordinates: [-122.4564, 37.6069] }
  },
  {
    name: 'San Bruno Mountain State Park',
    description: 'Urban mountain with city and bay views',
    distance: 5.0,
    elevation: 800,
    difficulty: 'moderate',
    tags: ['urban-mountain', 'city-views', 'bay-views'],
    location: { type: 'Point' as const, coordinates: [-122.4564, 37.6569] }
  },
  {
    name: 'Edgewood Park',
    description: 'Wildflower preserve with spring blooms',
    distance: 2.5,
    elevation: 300,
    difficulty: 'easy',
    tags: ['wildflowers', 'spring-blooms', 'preserve'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.4569] }
  },
  {
    name: 'Wunderlich County Park',
    description: 'Redwood groves and historic estate grounds',
    distance: 4.0,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['redwoods', 'historic', 'estate'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.4069] }
  },
  {
    name: 'Huddart Park',
    description: 'Redwood forest with creek and picnic areas',
    distance: 3.5,
    elevation: 400,
    difficulty: 'easy',
    tags: ['redwoods', 'creek', 'picnic'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.4069] }
  },
  {
    name: 'Windy Hill Open Space Preserve',
    description: 'Open grasslands with wind and panoramic views',
    distance: 4.5,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['grasslands', 'windy', 'panoramic-views'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.3569] }
  },
  {
    name: 'Russian Ridge Open Space Preserve',
    description: 'Ridge trail with wildflowers and bay views',
    distance: 5.0,
    elevation: 700,
    difficulty: 'moderate',
    tags: ['ridge', 'wildflowers', 'bay-views'],
    location: { type: 'Point' as const, coordinates: [-122.2564, 37.3569] }
  },
  {
    name: 'Monte Bello Open Space Preserve',
    description: 'Diverse habitats with creek and oak woodland',
    distance: 4.0,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['diverse-habitats', 'creek', 'oak-woodland'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.3569] }
  },
  {
    name: 'Skyline Ridge Open Space Preserve',
    description: 'Ridge trail with lake and grassland views',
    distance: 3.5,
    elevation: 400,
    difficulty: 'easy',
    tags: ['ridge', 'lake', 'grassland'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.3569] }
  },
  {
    name: 'Los Trancos Open Space Preserve',
    description: 'Earthquake trail with interpretive exhibits',
    distance: 2.0,
    elevation: 200,
    difficulty: 'easy',
    tags: ['earthquake', 'interpretive', 'exhibits'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.3569] }
  },
  {
    name: 'Fremont Older Open Space Preserve',
    description: 'Rolling hills with bay and valley views',
    distance: 4.5,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['rolling-hills', 'bay-views', 'valley-views'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.3569] }
  },
  {
    name: 'Stevens Creek County Park',
    description: 'Creek-side trails with redwoods and wildlife',
    distance: 3.0,
    elevation: 300,
    difficulty: 'easy',
    tags: ['creek-side', 'redwoods', 'wildlife'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.3069] }
  },
  {
    name: 'Rancho San Antonio Open Space Preserve',
    description: 'Popular park with farm animals and diverse trails',
    distance: 5.0,
    elevation: 400,
    difficulty: 'moderate',
    tags: ['popular', 'farm-animals', 'diverse'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.3069] }
  },
  {
    name: 'Foothills Park',
    description: 'Palo Alto park with lake and oak woodland',
    distance: 3.5,
    elevation: 200,
    difficulty: 'easy',
    tags: ['palo-alto', 'lake', 'oak-woodland'],
    location: { type: 'Point' as const, coordinates: [-122.1564, 37.3069] }
  },

  // South Bay Trails (81-100)
  {
    name: 'Mission Peak',
    description: 'Challenging climb with panoramic bay views',
    distance: 6.0,
    elevation: 2517,
    difficulty: 'hard',
    tags: ['challenging', 'panoramic', 'bay-views'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.5069] }
  },
  {
    name: 'Almaden Quicksilver County Park',
    description: 'Historic mercury mining area with diverse trails',
    distance: 7.0,
    elevation: 800,
    difficulty: 'moderate',
    tags: ['historic', 'mining', 'diverse'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.2069] }
  },
  {
    name: 'Castle Rock State Park',
    description: 'Rock formations and redwood forest',
    distance: 5.5,
    elevation: 1000,
    difficulty: 'moderate',
    tags: ['rock-formations', 'redwoods', 'forest'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.2569] }
  },
  {
    name: 'Saratoga Gap Open Space Preserve',
    description: 'Ridge trail with redwoods and bay views',
    distance: 4.0,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['ridge', 'redwoods', 'bay-views'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.2569] }
  },
  {
    name: 'Sierra Azul Open Space Preserve',
    description: 'Mountain preserve with oak woodland and grasslands',
    distance: 8.0,
    elevation: 1200,
    difficulty: 'hard',
    tags: ['mountain', 'oak-woodland', 'grasslands'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.2069] }
  },
  {
    name: 'Calero County Park',
    description: 'Lake with fishing and hiking trails',
    distance: 4.5,
    elevation: 300,
    difficulty: 'moderate',
    tags: ['lake', 'fishing', 'hiking'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.2069] }
  },
  {
    name: 'Santa Teresa County Park',
    description: 'Rolling hills with oak trees and wildflowers',
    distance: 5.0,
    elevation: 400,
    difficulty: 'moderate',
    tags: ['rolling-hills', 'oak-trees', 'wildflowers'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.2069] }
  },
  {
    name: 'Uvas Canyon County Park',
    description: 'Waterfall trail through redwood forest',
    distance: 3.5,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['waterfalls', 'redwoods', 'forest'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.1569] }
  },
  {
    name: 'Coyote Valley Open Space Preserve',
    description: 'Valley preserve with grasslands and wildlife',
    distance: 3.0,
    elevation: 200,
    difficulty: 'easy',
    tags: ['valley', 'grasslands', 'wildlife'],
    location: { type: 'Point' as const, coordinates: [-121.7564, 37.1569] }
  },
  {
    name: 'Anderson Lake County Park',
    description: 'Lake with boating and easy walking trails',
    distance: 2.5,
    elevation: 100,
    difficulty: 'easy',
    tags: ['lake', 'boating', 'easy'],
    location: { type: 'Point' as const, coordinates: [-121.7564, 37.1569] }
  },
  {
    name: 'Henry W. Coe State Park',
    description: 'Large wilderness park with diverse terrain',
    distance: 10.0,
    elevation: 1500,
    difficulty: 'hard',
    tags: ['wilderness', 'large', 'diverse-terrain'],
    location: { type: 'Point' as const, coordinates: [-121.5564, 37.1569] }
  },
  {
    name: 'Joseph D. Grant County Park',
    description: 'Historic ranch with rolling hills and oak trees',
    distance: 6.0,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['historic-ranch', 'rolling-hills', 'oak-trees'],
    location: { type: 'Point' as const, coordinates: [-121.6564, 37.3569] }
  },
  {
    name: 'Ed R. Levin County Park',
    description: 'Hills with hang gliding and panoramic views',
    distance: 4.0,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['hills', 'hang-gliding', 'panoramic-views'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.4569] }
  },
  {
    name: 'Coyote Hills Regional Park',
    description: 'Wetland preserve with bay views and wildlife',
    distance: 3.5,
    elevation: 100,
    difficulty: 'easy',
    tags: ['wetland', 'bay-views', 'wildlife'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.5569] }
  },
  {
    name: 'Sunol Regional Wilderness',
    description: 'Wilderness area with Little Yosemite and waterfalls',
    distance: 5.0,
    elevation: 600,
    difficulty: 'moderate',
    tags: ['wilderness', 'waterfalls', 'little-yosemite'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.6069] }
  },
  {
    name: 'Del Valle Regional Park',
    description: 'Lake with swimming, fishing, and hiking trails',
    distance: 4.0,
    elevation: 200,
    difficulty: 'moderate',
    tags: ['lake', 'swimming', 'fishing'],
    location: { type: 'Point' as const, coordinates: [-121.6564, 37.6069] }
  },
  {
    name: 'Pleasanton Ridge Regional Park',
    description: 'Ridge trail with oak woodland and valley views',
    distance: 5.5,
    elevation: 500,
    difficulty: 'moderate',
    tags: ['ridge', 'oak-woodland', 'valley-views'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.6569] }
  },
  {
    name: 'Shadow Cliffs Regional Recreation Area',
    description: 'Lake with swimming and easy walking trails',
    distance: 2.0,
    elevation: 50,
    difficulty: 'easy',
    tags: ['lake', 'swimming', 'easy'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.6569] }
  },
  {
    name: 'Dublin Hills Regional Park',
    description: 'Rolling hills with grassland and oak trees',
    distance: 3.5,
    elevation: 300,
    difficulty: 'moderate',
    tags: ['rolling-hills', 'grassland', 'oak-trees'],
    location: { type: 'Point' as const, coordinates: [-121.8564, 37.7069] }
  },
  {
    name: 'Las Trampas Regional Wilderness',
    description: 'Rugged wilderness area with steep trails',
    distance: 6.5,
    elevation: 1000,
    difficulty: 'hard',
    tags: ['wilderness', 'rugged', 'steep'],
    location: { type: 'Point' as const, coordinates: [-122.0564, 37.8069] }
  }
];
