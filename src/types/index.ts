export type TripType = 'city' | 'outside' | 'intercity' | 'oneway';

export type DurationOption = 1 | 2 | 4 | 6 | 8;

export type ScheduleType = 'now' | 'later';

export interface TripConfig {
  id: TripType;
  title: string;
  subtitle: string;
  popular?: boolean;
}

export interface DurationConfig {
  hours: DurationOption;
  price: number;
  label: string;
  popular?: boolean;
}

export interface BookingState {
  tripType: TripType;
  duration: DurationOption;
  scheduleType: ScheduleType;
  date: string;
  time: string;
  carType: 'sedan' | 'suv' | 'hatchback' | 'luxury';
  transmission: 'manual' | 'automatic';
  passengerType: 'self' | 'family';
  familyMemberName?: string;
  notes?: string;
  outstationMode?: 'district' | 'distance';
  outstationState?: 'telangana' | 'andhra';
  outstationDestinationId?: string;
  outstationDestinationName?: string;
  outstationDistrict?: string;
  outstationDistanceSlabId?: string;
  outstationDistanceRange?: string;
  outstationDays?: number;
  outstationPrice?: number;
  oneWayDays?: number;
  oneWayMode?: 'hours' | 'days';
}

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  rating: number;
  tripsCount: number;
  experienceYears: number;
  languages: string[];
  photo: string;
  badge: string;
  verified: boolean;
  carSpecialty: string;
  favorite?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'Parent' | 'Grandparent' | 'Spouse' | 'Child' | 'Other';
  phone: string;
  emergencyContact: boolean;
  avatar: string;
}

export interface BookingRecord {
  id: string;
  date: string;
  time: string;
  tripType: TripType;
  duration: number;
  amount: number;
  driver?: Driver | null;
  status: 'pending' | 'assigned' | 'accepted' | 'upcoming' | 'completed' | 'ongoing' | 'cancelled';
  forWhom: string;
  carName: string;
  area?: string;
  notes?: string;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, monthNum, dayNum] = match;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parseInt(monthNum, 10) - 1] || monthNum;
    const day = parseInt(dayNum, 10);
    const shortYear = year.slice(-2);
    return `${day} ${month} ${shortYear}`;
  }
  return dateStr;
}

export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

export const DEFAULT_DRIVER_NO_PHOTO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="24" fill="%23F1F5F9"/><circle cx="60" cy="46" r="19" fill="%2394A3B8"/><path d="M28 98c0-17.673 14.327-32 32-32s32 14.327 32 32H28z" fill="%2394A3B8"/></svg>';
