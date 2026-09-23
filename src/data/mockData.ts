import { GalleryItem, DirectoryMember, AssociationEvent } from '../types';

export const AP_DISTRICTS = [
  'Vijayawada / NTR',
  'Visakhapatnam',
  'Guntur',
  'Krishna',
  'Tirupati',
  'Kurnool',
  'East Godavari',
  'West Godavari',
  'Anantapur',
  'Nellore',
  'Chittoor',
  'YSR Kadapa',
  'Prakasam',
  'Srikakulam',
  'Vizianagaram',
  'Anakapalli',
  'Kakinada',
  'Eluru',
  'Bapatla',
  'Palnadu',
  'Nandyal',
  'Sri Sathya Sai',
  'Annamayya',
  'Alluri Sitharama Raju',
  'Parvathipuram Manyam',
  'Dr. B.R. Ambedkar Konaseema'
];

export const BUSINESS_TYPES = [
  'Solar EPC',
  'Solar Installer',
  'Solar Integrator',
  'Solar Equipment Supplier',
  'Solar Consultant',
  'Manufacturer',
  'Other'
];

export const EXPERIENCE_LEVELS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUPiMpgphb5uiyHX0JrShc3o7QpcQF063-MZA2MAakcIUQAjOLKgYkFKfTvDgdctoTdSbyXqCc_aqTXI6etkdVimL63rPw7CEZVaCygRR6_sk6DS9mzBbebocZdGeZ_pOnIf_L26bonPcrHZqcrVTZ6OK3u7M8vXut50MZp0rTzp5v-HrhFHRezPbKwY9EUNxFov5O16LW4SArpqRHQjO28uxL6B8V2Di7XP6sc0LkSy1YfXneEAqloA',
    category: 'Conferences',
    categorySlug: 'conferences',
    title: 'State Solar Energy Leadership Summit',
    desc: 'APSIWA executive council presiding over the inter-state regulatory dialogue on open access, MNRE subsidies, and distribution alignment.',
    date: 'Oct 18, 2025',
    location: 'Vijayawada',
    dataAlt: 'India Solar Energy Leadership Forum with esteemed panel delegates including ISA President Mr. Rajesh Kapoor and Clean Energy Council leaders seated at official dais with microphones, nameplates, Tata Power and Adani Solar partner backdrop.'
  },
  {
    id: 'g2',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoQdfUzyfDoAg3eBpKxB13AN802rUDKb8yQR-wETcm_wHsIaOi9nVkBvP9ahW6iLXbU5m78EGnStNfPtMYsKq3aBg2OVcNRe50304-CvazpqJ4xYb_5ZC7ojlq1-ovajjYrKIM_5AnOcIruhPV4WLBEMlc1A07kH-l-0tZHlUAq0aTBLeNSI3FDng9O6tJv_kffZ4Qb94JqXRiP_yd5y_DF50WSslWuRxUQu5LDz_LLcmQT6S7T3W1mA',
    category: 'Workshops',
    categorySlug: 'workshops',
    title: 'Field Inspection & Quality Audit',
    desc: 'Certified integrators undergoing hands-on photovoltaic string testing, IV-curve diagnostics, and thermographic module verification.',
    date: 'Nov 04, 2025',
    location: 'Guntur Dist.',
    dataAlt: 'Professional Indian solar engineers and technicians inspecting solar plant modules'
  },
  {
    id: 'g3',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8d5FAhZFLuNIj7nZHjF7edfAGW3ZDEkvcBcCAxaCqcnB2RuEWhkEkRyHEuijARpDbqF88agy0cmZUHPnHsHyadPhmURCCdPtgK89k2-suGCP8_oFYDWPUUz2C8w8x_6TCDqlDBrXpFWzgXNl1rGV-u3SgPryHMxJq-xKiXwocaESWTQuamvlsB1CAu6ba7Qo5fYyCLLYbW32wGABVBaktUpUKdnlc1GG3MxC3swpu3W5ijqXeXiUIPw',
    category: 'Activities',
    categorySlug: 'activities',
    title: 'Megawatt Rooftop Commissioning',
    desc: 'Successful synchronization of 2.4 MW industrial rooftop installation by APSIWA consortium EPCs under clean energy transition targets.',
    date: 'Dec 12, 2025',
    location: 'Sri City, Tirupati',
    dataAlt: 'Modern commercial rooftop solar photovoltaic panel installation against clear blue sky'
  },
  {
    id: 'g4',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3N0t85peVWsF-V4vfBJAXCbrAgV5To7PK52XjgrNM0X4IEFObBFlkNxjlybe2WdJGYdEaE8EuQLt-ZSBoStGd0tSvM_zHfct-fKu4owemRdknd0S2h7XmOw7edBm3CJv390fjcS9J6jLbEaHWFh2zv1yV3K64UDw2Fs37B_MzgJiPN_731L6zNKkFLld0nXC1uMPEJDrEO04QMneydTqqzdEIl5QlVFqb0s1EC9TWDn6Lx_UdTVHSmg',
    category: 'Meetings',
    categorySlug: 'meetings',
    title: 'DISCOM Liaison Roundtable',
    desc: 'Deliberations with CPDCL and EPDCL regulatory boards addressing net-metering application turnaround and bi-directional meter supplies.',
    date: 'Jan 14, 2026',
    location: 'Amaravati',
    dataAlt: 'High-level formal administrative boardroom meeting between solar association representatives and Andhra Pradesh state power distribution executives, presentation slides on screen, official files on conference table, bright executive room lighting.'
  },
  {
    id: 'g5',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmGUsgXK4pAhqwRPf6HRJOUp8yrvBOuA2yzNmtnMQr_ZJcbL5xkOV3SQHv_vCFO9tk3Aa1Xym8_4zLBlQ-6Up7HznvA3DfIH6fWg51Hz1IGZGibHRvdTLQmJvyyVXjctrxYVZPoQ1jvjZ2AToylTloDTmM4_xiGqJgUEPF5AWNMZtSetUZrLktwv4rm8Blqa5URNniz6IVVcOFfaFqaI5hAO6wRnuGThephRK_PcTPwzZdsjvIKQ4VcQ',
    category: 'Workshops',
    categorySlug: 'workshops',
    title: 'Safety & Compliance Workshop',
    desc: 'Mandatory CEA grid connectivity safety standard protocols and working-at-heights certification session for regional site engineers.',
    date: 'Jan 29, 2026',
    location: 'Visakhapatnam',
    dataAlt: 'Technical occupational safety seminar for solar installers with trainers explaining harness equipment, fall arrest systems, and high voltage DC safety protocols in a modern auditorium in Visakhapatnam.'
  },
  {
    id: 'g6',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCANwJsqPalHjQbCunnj2UAVME-wr44CL6iH_u0o25cczqBpO6Tf0u8ZVYLKFy4ot2I8p6RB0mks9CdO2xetPiLe48gp5zsK-tKJS-3NIyFnRhXfxONcYgbjEHSy0mdDmFIgNH2DuUkuetlhgB4N7cTYzLJnbesy2M0d3VSRCZzhKsZw16HcrT4RvVO1SWgTkvfgNnNeTpxeQ-i6ihd1NxoykgzYVuW9Uy5vGjP3cBSQe4m5KalWzOF1A',
    category: 'Events',
    categorySlug: 'events',
    title: 'Annual General Body Meeting 2025',
    desc: 'Conferment of integrator accreditation certifications, strategic review of AP solar policy 2025-2030, and executive committee elections.',
    date: 'Feb 10, 2026',
    location: 'Vijayawada',
    dataAlt: 'Grand hotel auditorium filled with delegates at the APSIWA Annual General Body Meeting, stage presentation about Andhra Pradesh solar roadmaps, illuminated banners, engaged professional audience.'
  },
  {
    id: 'g7',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTaOGP9h8OR1SfNS2F0r792QW1qIoNzyN2hv8BAo8Z8gfxh-CrmsNluvT8RpMuk9UvN72Lh2rRlSdilFP7TL8hE_ytV-wKdr-koFG-DTlp7zdZTqkAbpFcT3wqFEurn2YxtJJ7g3qbYXJCfidywsOk98Tx1JH8rlqOer9fPYGOn4XHyaxqwCYC4QirZvWDmpgiKX8W_IsHEtkDYNzLHcsVrNoKqhYcmTGtn05yBMEMbFgo8I20HbEk3g',
    category: 'Workshops',
    categorySlug: 'workshops',
    title: 'Inverter Technology Masterclass',
    desc: 'Comprehensive training on hybrid inverters, BESS battery storage integration, and microgrid synchronization for commercial installations.',
    date: 'Feb 24, 2026',
    location: 'Tirupati',
    dataAlt: 'Technical laboratory workshop with electronic test instruments and string inverter cutaways being demonstrated to renewable energy engineers by German and Indian manufacturing experts.'
  },
  {
    id: 'g8',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqoJT0InuYywbwyFbpTIVkMM8cI_j85dWDa79676jx4Nd4BiHA_tqEiEQqjTxp9MWWtGtQYyVVez5ZoxLC7GltN1F1SgGTU1tHaxd2g_TE0OlYCgXxz84dhZaKpRYzQn1YfsLjI-mHhGk0BE-gyOAc0Ghsuu06GT7YVs9BTVjbrKQvxrPLsm_Vas05FlbfIKbZwCZYgda5R7bXfqtd41y8egaoyOfqmJnT_uXV10x0cP21pM1Uom0jQg',
    category: 'Activities',
    categorySlug: 'activities',
    title: 'Ground-mount Farm Inspection',
    desc: 'Technical performance assessment and high-tension substation interconnect review at the 50 MW Kurnool district solar cluster.',
    date: 'Mar 02, 2026',
    location: 'Kurnool',
    dataAlt: 'Vast utility-scale ground mounted solar farm in Kurnool Andhra Pradesh under bright sunlight, tracking solar arrays stretching to horizon with inspection convoy and solar engineers in foreground.'
  }
];

export const INITIAL_MEMBERS: DirectoryMember[] = [
  {
    id: 'APSIWA-2025-00101',
    companyName: 'Amaravati Solar Energies Pvt Ltd',
    contactPerson: 'Sridhar Reddy',
    district: 'Vijayawada / NTR',
    businessType: 'Solar EPC',
    experience: '5-10 years',
    verified: true,
    phone: '+91 98480 12345',
    email: 'info@amaravatisolar.com',
    capacityInstalled: '18.4 MW'
  },
  {
    id: 'APSIWA-2025-00102',
    companyName: 'Rayalaseema SunPower Systems',
    contactPerson: 'K. Venkateswara Rao',
    district: 'Tirupati',
    businessType: 'Solar Integrator',
    experience: '3-5 years',
    verified: true,
    phone: '+91 94401 56789',
    email: 'contact@sunpowersystems.in',
    capacityInstalled: '8.2 MW'
  },
  {
    id: 'APSIWA-2025-00103',
    companyName: 'Vizag Green Grid Infra',
    contactPerson: 'M. Chandrasekhar',
    district: 'Visakhapatnam',
    businessType: 'Solar EPC',
    experience: '10+ years',
    verified: true,
    phone: '+91 89125 43210',
    email: 'chandu@vizaggreengrid.com',
    capacityInstalled: '34.0 MW'
  },
  {
    id: 'APSIWA-2025-00104',
    companyName: 'Krishna Valley Photovoltaics',
    contactPerson: 'G. Suresh Babu',
    district: 'Krishna',
    businessType: 'Solar Installer',
    experience: '3-5 years',
    verified: true,
    phone: '+91 98852 98765',
    email: 'support@krishnavalleysolar.com',
    capacityInstalled: '5.6 MW'
  },
  {
    id: 'APSIWA-2025-00105',
    companyName: 'Kurnool Helios Tech Labs',
    contactPerson: 'P. Ramanjaneyulu',
    district: 'Kurnool',
    businessType: 'Solar Equipment Supplier',
    experience: '5-10 years',
    verified: true,
    phone: '+91 85182 65432',
    email: 'sales@heliostechlabs.com',
    capacityInstalled: '12.0 MW'
  },
  {
    id: 'APSIWA-2025-00106',
    companyName: 'Godavari Clean Energy Works',
    contactPerson: 'V. Satyanarayana',
    district: 'East Godavari',
    businessType: 'Solar EPC',
    experience: '5-10 years',
    verified: true,
    phone: '+91 88423 78901',
    email: 'epc@godavaricleanenergy.in',
    capacityInstalled: '14.5 MW'
  }
];

export const DEFAULT_EVENTS: AssociationEvent[] = [
  {
    id: 'evt-2026-01',
    title: 'Andhra Pradesh Solar Expo & Conclave 2026',
    description: 'Premier solar technology showcase, state policy dialogues, Tier-1 module distributor networking, and PM-Surya Ghar subsidy facilitation.',
    date: '2026-10-15',
    time: '09:30 AM - 05:30 PM',
    endDate: '2026-10-16',
    expiresAt: '2026-10-16T23:59:59',
    location: 'Vijayawada',
    venue: 'A-Plus Convention Centre, MG Road, Vijayawada',
    category: 'Expo',
    bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUPiMpgphb5uiyHX0JrShc3o7QpcQF063-MZA2MAakcIUQAjOLKgYkFKfTvDgdctoTdSbyXqCc_aqTXI6etkdVimL63rPw7CEZVaCygRR6_sk6DS9mzBbebocZdGeZ_pOnIf_L26bonPcrHZqcrVTZ6OK3u7M8vXut50MZp0rTzp5v-HrhFHRezPbKwY9EUNxFov5O16LW4SArpqRHQjO28uxL6B8V2Di7XP6sc0LkSy1YfXneEAqloA',
    registrationLink: '#membership',
    autoRemoveOnExpiry: true,
    status: 'Upcoming',
    featured: true,
    organizer: 'APSIWA State Council',
    contactPhone: '+91 866 248 9000',
    createdAt: '2026-09-01'
  },
  {
    id: 'evt-2026-02',
    title: 'Rooftop Solar EPC Best Practices & Grid Safety Workshop',
    description: 'Technical masterclass on DISCOM bi-directional net-metering synchronization, DC isolator protocols, and CEA safety compliance.',
    date: '2026-11-05',
    time: '10:00 AM - 04:00 PM',
    expiresAt: '2026-11-05T20:00:00',
    location: 'Visakhapatnam',
    venue: 'Novotel Varun Beach Convention Hall, Vizag',
    category: 'Workshop',
    bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoQdfUzyfDoAg3eBpKxB13AN802rUDKb8yQR-wETcm_wHsIaOi9nVkBvP9ahW6iLXbU5m78EGnStNfPtMYsKq3aBg2OVcNRe50304-CvazpqJ4xYb_5ZC7ojlq1-ovajjYrKIM_5AnOcIruhPV4WLBEMlc1A07kH-l-0tZHlUAq0aTBLeNSI3FDng9O6tJv_kffZ4Qb94JqXRiP_yd5y_DF50WSslWuRxUQu5LDz_LLcmQT6S7T3W1mA',
    registrationLink: '#membership',
    autoRemoveOnExpiry: true,
    status: 'Upcoming',
    featured: false,
    organizer: 'APSIWA Technical Committee',
    contactPhone: '+91 891 270 4500',
    createdAt: '2026-09-10'
  },
  {
    id: 'evt-2026-03',
    title: 'DISCOM & APERC Clean Energy Regulatory Dialogue',
    description: 'High-level round table addressing open access tariff rationalization, grid stability for MW rooftops, and standardizing inspection turnarounds.',
    date: '2026-12-08',
    time: '11:00 AM - 03:30 PM',
    expiresAt: '2026-12-08T18:00:00',
    location: 'Amaravati',
    venue: 'AP Secretariat Conference Hall, Amaravati',
    category: 'Conference',
    bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3N0t85peVWsF-V4vfBJAXCbrAgV5To7PK52XjgrNM0X4IEFObBFlkNxjlybe2WdJGYdEaE8EuQLt-ZSBoStGd0tSvM_zHfct-fKu4owemRdknd0S2h7XmOw7edBm3CJv390fjcS9J6jLbEaHWFh2zv1yV3K64UDw2Fs37B_MzgJiPN_731L6zNKkFLld0nXC1uMPEJDrEO04QMneydTqqzdEIl5QlVFqb0s1EC9TWDn6Lx_UdTVHSmg',
    registrationLink: '#contact',
    autoRemoveOnExpiry: true,
    status: 'Upcoming',
    featured: true,
    organizer: 'APSIWA Secretariat',
    contactPhone: '+91 866 248 9000',
    createdAt: '2026-09-15'
  }
];

