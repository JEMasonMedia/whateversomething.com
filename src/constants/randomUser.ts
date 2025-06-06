import type { UserType } from '../types/randomUser' //, RandomUserApiResponse

export const GENDERS = [
  { label: 'Any', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

export const NATIONALITIES = [
  { label: 'Any', value: '' },
  { label: 'Australia', value: 'au' },
  { label: 'Brazil', value: 'br' },
  { label: 'Canada', value: 'ca' },
  { label: 'Switzerland', value: 'ch' },
  { label: 'Germany', value: 'de' },
  { label: 'Denmark', value: 'dk' },
  { label: 'Spain', value: 'es' },
  { label: 'Finland', value: 'fi' },
  { label: 'France', value: 'fr' },
  { label: 'United Kingdom', value: 'gb' },
  { label: 'Ireland', value: 'ie' },
  { label: 'India', value: 'in' },
  { label: 'Iran', value: 'ir' },
  { label: 'Mexico', value: 'mx' },
  { label: 'Netherlands', value: 'nl' },
  { label: 'Norway', value: 'no' },
  { label: 'New Zealand', value: 'nz' },
  { label: 'Serbia', value: 'rs' },
  { label: 'Turkey', value: 'tr' },
  { label: 'Ukraine', value: 'ua' },
  { label: 'United States', value: 'us' },
]

export const USER_COUNTS = [5, 10, 20, 50, 100]

export const FIELD_MAP: Record<UserType, string | undefined> = {
  minimal: 'login,name,email,id,picture',
  expanded: 'login,name,email,id,location,picture',
  all: undefined,
}
