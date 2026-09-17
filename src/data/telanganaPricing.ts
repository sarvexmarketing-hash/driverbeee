export type StateRegion = 'telangana' | 'andhra';

export interface OutstationOption {
  days: number;
  label: string;
  price: number;
  rateNote?: string;
}

export interface OutstationDestination {
  id: string;
  state?: StateRegion;
  district: string;
  destination: string;
  packageType: '1 Day' | '2 Day' | '1–2 Day';
  options: OutstationOption[];
  distanceKm?: number | string;
  rateNote?: string;
  popular?: boolean;
}

export type TelanganaDestination = OutstationDestination;

export interface DistanceSlab {
  id: string;
  range: string;
  minKm: number;
  maxKm?: number;
  pricePerDay: number;
  label: string;
  description: string;
  popular?: boolean;
}

export const DISTANCE_SLABS: DistanceSlab[] = [
  {
    id: 'slab-100-150',
    range: '100 – 150 km',
    minKm: 100,
    maxKm: 150,
    pricePerDay: 1200,
    label: '100 – 150 km',
    description: 'From customer location (e.g. 100 to 150 km distance)',
    popular: true,
  },
  {
    id: 'slab-150-250',
    range: '150 – 250 km',
    minKm: 150,
    maxKm: 250,
    pricePerDay: 1500,
    label: '150 – 250 km',
    description: 'From customer location (e.g. 150 to 250 km distance)',
    popular: true,
  },
  {
    id: 'slab-above-250',
    range: 'Above 250 km',
    minKm: 250,
    pricePerDay: 1800,
    label: 'Above 250 km',
    description: 'From customer location (e.g. 250+ km long distance journeys)',
    popular: true,
  },
];

export const TELANGANA_DISTRICT_PRICING: TelanganaDestination[] = [
  // 0–135 km Slab: ₹1,200 / day
  {
    id: 'hanamkonda-warangal-outskirts',
    state: 'telangana',
    district: 'Hanamkonda / Warangal (Outskirts)',
    destination: 'Warangal / Hanamkonda Outskirts',
    distanceKm: '0–30',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'jangaon',
    state: 'telangana',
    district: 'Jangaon',
    destination: 'Jangaon',
    distanceKm: 60,
    rateNote: '(Min)',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200, rateNote: '(Min)' },
      { days: 2, label: '2 Day', price: 2400 },
    ],
    popular: true,
  },
  {
    id: 'jayashanker-bhupalpally',
    state: 'telangana',
    district: 'Jayashanker Bhupalpally',
    destination: 'Bhupalpally',
    distanceKm: 70,
    rateNote: '(Min)',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200, rateNote: '(Min)' },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'mahabubabad',
    state: 'telangana',
    district: 'Mahabubabad',
    destination: 'Mahabubabad',
    distanceKm: 65,
    rateNote: '(Min)',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200, rateNote: '(Min)' },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'mulugu',
    state: 'telangana',
    district: 'Mulugu',
    destination: 'Mulugu',
    distanceKm: 75,
    rateNote: '(Min)',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200, rateNote: '(Min)' },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'siddipet',
    state: 'telangana',
    district: 'Siddipet',
    destination: 'Siddipet',
    distanceKm: 90,
    rateNote: '(Min)',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200, rateNote: '(Min)' },
      { days: 2, label: '2 Day', price: 2400 },
    ],
    popular: true,
  },
  {
    id: 'karimnagar',
    state: 'telangana',
    district: 'Karimnagar',
    destination: 'Karimnagar',
    distanceKm: 110,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
    popular: true,
  },
  {
    id: 'peddapalli',
    state: 'telangana',
    district: 'Peddapalli',
    destination: 'Peddapalli',
    distanceKm: 120,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'rajanna-sircilla',
    state: 'telangana',
    district: 'Rajanna Sircilla',
    destination: 'Sircilla',
    distanceKm: 120,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'nalgonda',
    state: 'telangana',
    district: 'Nalgonda',
    destination: 'Nalgonda',
    distanceKm: 125,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'jagtial',
    state: 'telangana',
    district: 'Jagtial',
    destination: 'Jagtial',
    distanceKm: 130,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'khammam',
    state: 'telangana',
    district: 'Khammam',
    destination: 'Khammam',
    distanceKm: 135,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
    popular: true,
  },
  {
    id: 'medchal-malkajgiri',
    state: 'telangana',
    district: 'Medchal-Malkajgiri',
    destination: 'Medchal',
    distanceKm: 135,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },
  {
    id: 'yadadri-bhuvanagiri',
    state: 'telangana',
    district: 'Yadadri Bhuvanagiri',
    destination: 'Bhongir',
    distanceKm: 100,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1200 },
      { days: 2, label: '2 Day', price: 2400 },
    ],
  },

  // 145–240 km Slab: ₹1,500 / day
  {
    id: 'hyderabad',
    state: 'telangana',
    district: 'Hyderabad',
    destination: 'Hyderabad',
    distanceKm: 145,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
    popular: true,
  },
  {
    id: 'mancherial',
    state: 'telangana',
    district: 'Mancherial',
    destination: 'Mancherial',
    distanceKm: 150,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'rangareddy',
    state: 'telangana',
    district: 'Ranga Reddy',
    destination: 'Shamshabad / Ranga Reddy',
    distanceKm: 155,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
    popular: true,
  },
  {
    id: 'bhadradri-kothagudem',
    state: 'telangana',
    district: 'Bhadradri Kothagudem',
    destination: 'Kothagudem',
    distanceKm: 160,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'kamareddy',
    state: 'telangana',
    district: 'Kamareddy',
    destination: 'Kamareddy',
    distanceKm: 170,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'medak',
    state: 'telangana',
    district: 'Medak',
    destination: 'Medak',
    distanceKm: 170,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'sangareddy',
    state: 'telangana',
    district: 'Sangareddy',
    destination: 'Sangareddy',
    distanceKm: 175,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'nizamabad',
    state: 'telangana',
    district: 'Nizamabad',
    destination: 'Nizamabad',
    distanceKm: 190,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
    popular: true,
  },
  {
    id: 'vikarabad',
    state: 'telangana',
    district: 'Vikarabad',
    destination: 'Vikarabad',
    distanceKm: 200,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'mahabubnagar',
    state: 'telangana',
    district: 'Mahabubnagar',
    destination: 'Mahabubnagar',
    distanceKm: 210,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'nirmal',
    state: 'telangana',
    district: 'Nirmal',
    destination: 'Nirmal',
    distanceKm: 210,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'nagarkurnool',
    state: 'telangana',
    district: 'Nagarkurnool',
    destination: 'Nagarkurnool',
    distanceKm: 240,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },

  // 260–300 km Slab: ₹1,800 / day
  {
    id: 'adilabad',
    state: 'telangana',
    district: 'Adilabad',
    destination: 'Adilabad',
    distanceKm: 260,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'narayanpet',
    state: 'telangana',
    district: 'Narayanpet',
    destination: 'Narayanpet',
    distanceKm: 270,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'wanaparthy',
    state: 'telangana',
    district: 'Wanaparthy',
    destination: 'Wanaparthy',
    distanceKm: 270,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'kumuram-bheem-asifabad',
    state: 'telangana',
    district: 'Kumuram Bheem Asifabad',
    destination: 'Asifabad',
    distanceKm: 280,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'jogulamba-gadwal',
    state: 'telangana',
    district: 'Jogulamba Gadwal',
    destination: 'Gadwal',
    distanceKm: 300,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
];

export const ANDHRA_DISTRICT_PRICING: OutstationDestination[] = [
  // 200–240 km Slab: ₹1,500 / day
  {
    id: 'ap-eluru',
    state: 'andhra',
    district: 'Eluru',
    destination: 'Eluru',
    distanceKm: 200,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'ap-ntr-vijayawada',
    state: 'andhra',
    district: 'NTR (Vijayawada)',
    destination: 'Vijayawada',
    distanceKm: 210,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
    popular: true,
  },
  {
    id: 'ap-bapatla',
    state: 'andhra',
    district: 'Bapatla',
    destination: 'Bapatla',
    distanceKm: 230,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },
  {
    id: 'ap-guntur',
    state: 'andhra',
    district: 'Guntur',
    destination: 'Guntur',
    distanceKm: 230,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
    popular: true,
  },
  {
    id: 'ap-west-godavari',
    state: 'andhra',
    district: 'West Godavari (Bhimavaram)',
    destination: 'Bhimavaram',
    distanceKm: 240,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1500 },
      { days: 2, label: '2 Day', price: 3000 },
    ],
  },

  // 250–530 km Slab: ₹1,800 / day
  {
    id: 'ap-krishna',
    state: 'andhra',
    district: 'Krishna (Machilipatnam)',
    destination: 'Machilipatnam',
    distanceKm: 250,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-east-godavari',
    state: 'andhra',
    district: 'East Godavari',
    destination: 'Rajahmundry',
    distanceKm: 260,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
    popular: true,
  },
  {
    id: 'ap-palnadu',
    state: 'andhra',
    district: 'Palnadu',
    destination: 'Narasaraopet',
    distanceKm: 260,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-kakinada',
    state: 'andhra',
    district: 'Kakinada',
    destination: 'Kakinada',
    distanceKm: 270,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
    popular: true,
  },
  {
    id: 'ap-konaseema',
    state: 'andhra',
    district: 'Dr. B.R. Ambedkar Konaseema',
    destination: 'Amalapuram',
    distanceKm: 290,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-prakasam',
    state: 'andhra',
    district: 'Prakasam',
    destination: 'Ongole',
    distanceKm: 290,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-anakapalli',
    state: 'andhra',
    district: 'Anakapalli',
    destination: 'Anakapalli',
    distanceKm: 330,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-nandyal',
    state: 'andhra',
    district: 'Nandyal',
    destination: 'Nandyal',
    distanceKm: 350,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-spsr-nellore',
    state: 'andhra',
    district: 'SPSR Nellore',
    destination: 'Nellore',
    distanceKm: 350,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-visakhapatnam',
    state: 'andhra',
    district: 'Visakhapatnam',
    destination: 'Visakhapatnam (Vizag)',
    distanceKm: 350,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
    popular: true,
  },
  {
    id: 'ap-alluri-sitharama-raju',
    state: 'andhra',
    district: 'Alluri Sitharama Raju',
    destination: 'Paderu / Araku Valley',
    distanceKm: 380,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-kurnool',
    state: 'andhra',
    district: 'Kurnool',
    destination: 'Kurnool',
    distanceKm: 380,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-vizianagaram',
    state: 'andhra',
    district: 'Vizianagaram',
    destination: 'Vizianagaram',
    distanceKm: 390,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-parvathipuram',
    state: 'andhra',
    district: 'Parvathipuram Manyam',
    destination: 'Parvathipuram',
    distanceKm: 420,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-sri-sathya-sai',
    state: 'andhra',
    district: 'Sri Sathya Sai',
    destination: 'Puttaparthi / Hindupur',
    distanceKm: 430,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-ananthapuramu',
    state: 'andhra',
    district: 'Ananthapuramu',
    destination: 'Anantapur',
    distanceKm: 440,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-ysr-kadapa',
    state: 'andhra',
    district: 'YSR Kadapa',
    destination: 'Kadapa',
    distanceKm: 440,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-srikakulam',
    state: 'andhra',
    district: 'Srikakulam',
    destination: 'Srikakulam',
    distanceKm: 480,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-tirupati',
    state: 'andhra',
    district: 'Tirupati',
    destination: 'Tirupati (Temple City)',
    distanceKm: 480,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
    popular: true,
  },
  {
    id: 'ap-annamayya',
    state: 'andhra',
    district: 'Annamayya',
    destination: 'Rayachoti',
    distanceKm: 510,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
  {
    id: 'ap-chittoor',
    state: 'andhra',
    district: 'Chittoor',
    destination: 'Chittoor',
    distanceKm: 530,
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 1800 },
      { days: 2, label: '2 Day', price: 3600 },
    ],
  },
];

export const ALL_OUTSTATION_PRICING: OutstationDestination[] = [
  ...TELANGANA_DISTRICT_PRICING.map((d) => ({ ...d, state: 'telangana' as StateRegion })),
  ...ANDHRA_DISTRICT_PRICING,
];

