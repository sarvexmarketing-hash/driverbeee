export interface OutstationOption {
  days: 1 | 2;
  label: string;
  price: number;
}

export interface TelanganaDestination {
  id: string;
  district: string;
  destination: string;
  packageType: '1 Day' | '2 Day' | '1–2 Day';
  options: OutstationOption[];
  popular?: boolean;
}

export const TELANGANA_DISTRICT_PRICING: TelanganaDestination[] = [
  {
    id: 'hyderabad',
    district: 'Hyderabad',
    destination: 'Hyderabad',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 2000 }],
    popular: true,
  },
  {
    id: 'karimnagar',
    district: 'Karimnagar',
    destination: 'Karimnagar',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1500 }],
    popular: true,
  },
  {
    id: 'khammam',
    district: 'Khammam',
    destination: 'Khammam',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1800 }],
    popular: true,
  },
  {
    id: 'rangareddy',
    district: 'Rangareddy',
    destination: 'Shamshabad / District Admin Area',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 2500 },
      { days: 2, label: '2 Day', price: 3800 },
    ],
    popular: true,
  },
  {
    id: 'jangaon',
    district: 'Jangaon',
    destination: 'Jangaon',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1500 }],
    popular: true,
  },
  {
    id: 'siddipet',
    district: 'Siddipet',
    destination: 'Siddipet',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1700 }],
    popular: true,
  },
  {
    id: 'nizamabad',
    district: 'Nizamabad',
    destination: 'Nizamabad',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 2500 },
      { days: 2, label: '2 Day', price: 3800 },
    ],
    popular: true,
  },
  {
    id: 'adilabad',
    district: 'Adilabad',
    destination: 'Adilabad',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 4500 }],
    popular: true,
  },
  {
    id: 'bhadradri-kothagudem',
    district: 'Bhadradri Kothagudem',
    destination: 'Kothagudem',
    packageType: '1–2 Day',
    options: [
      { days: 1, label: '1 Day', price: 2300 },
      { days: 2, label: '2 Day', price: 3800 },
    ],
  },
  {
    id: 'jagtial',
    district: 'Jagtial',
    destination: 'Jagtial',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1800 }],
  },
  {
    id: 'jayashankar-bhupalpally',
    district: 'Jayashankar Bhupalpally',
    destination: 'Bhupalpally',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1500 }],
  },
  {
    id: 'jogulamba-gadwal',
    district: 'Jogulamba Gadwal',
    destination: 'Gadwal',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 4500 }],
  },
  {
    id: 'kamareddy',
    district: 'Kamareddy',
    destination: 'Kamareddy',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 2400 }],
  },
  {
    id: 'kumuram-bheem-asifabad',
    district: 'Kumuram Bheem Asifabad',
    destination: 'Asifabad',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 3500 }],
  },
  {
    id: 'mahabubabad',
    district: 'Mahabubabad',
    destination: 'Mahabubabad',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1500 }],
  },
  {
    id: 'mahabubnagar',
    district: 'Mahabubnagar',
    destination: 'Mahabubnagar',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 3800 }],
  },
  {
    id: 'mancherial',
    district: 'Mancherial',
    destination: 'Mancherial',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 2200 }],
  },
  {
    id: 'medak',
    district: 'Medak',
    destination: 'Medak',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 2300 }],
  },
  {
    id: 'medchal-malkajgiri',
    district: 'Medchal-Malkajgiri',
    destination: 'Medchal',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 2200 }],
  },
  {
    id: 'mulugu',
    district: 'Mulugu',
    destination: 'Mulugu',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1500 }],
  },
  {
    id: 'nagarkurnool',
    district: 'Nagarkurnool',
    destination: 'Nagarkurnool',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 3500 }],
  },
  {
    id: 'nalgonda',
    district: 'Nalgonda',
    destination: 'Nalgonda',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 2000 }],
  },
  {
    id: 'narayanpet',
    district: 'Narayanpet',
    destination: 'Narayanpet',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 4000 }],
  },
  {
    id: 'nirmal',
    district: 'Nirmal',
    destination: 'Nirmal',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 3500 }],
  },
  {
    id: 'peddapalli',
    district: 'Peddapalli',
    destination: 'Peddapalli',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1600 }],
  },
  {
    id: 'rajanna-sircilla',
    district: 'Rajanna Sircilla',
    destination: 'Sircilla',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1800 }],
  },
  {
    id: 'sangareddy',
    district: 'Sangareddy',
    destination: 'Sangareddy',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 3800 }],
  },
  {
    id: 'suryapet',
    district: 'Suryapet',
    destination: 'Suryapet',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 1800 }],
  },
  {
    id: 'vikarabad',
    district: 'Vikarabad',
    destination: 'Vikarabad',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 3800 }],
  },
  {
    id: 'wanaparthy',
    district: 'Wanaparthy',
    destination: 'Wanaparthy',
    packageType: '2 Day',
    options: [{ days: 2, label: '2 Day', price: 4000 }],
  },
  {
    id: 'yadadri-bhuvanagiri',
    district: 'Yadadri Bhuvanagiri',
    destination: 'Bhongir',
    packageType: '1 Day',
    options: [{ days: 1, label: '1 Day', price: 2000 }],
  },
];
