export type TripType = 'city' | 'outside' | 'airport' | 'intercity';

export type DurationOption = 2 | 4 | 6 | 8;

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
}

export interface Driver {
  id: string;
  name: string;
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
  duration: DurationOption;
  amount: number;
  driver?: Driver | null;
  status: 'pending' | 'assigned' | 'accepted' | 'upcoming' | 'completed' | 'ongoing' | 'cancelled';
  forWhom: string;
  carName: string;
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
