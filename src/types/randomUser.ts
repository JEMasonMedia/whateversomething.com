export type UserName = {
  title: string
  first: string
  last: string
}

export type UserID = {
  name: string
  value: string | null
}

export type UserLogin = {
  uuid: string
  username: string
  password: string
  salt: string
  md5: string
  sha1: string
  sha256: string
}

export type UserDOB = {
  date: string
  age: number
}

export type UserRegistered = {
  date: string
  age: number
}

export type UserPicture = {
  large: string
  medium: string
  thumbnail: string
}

export type UserStreet = {
  number: number
  name: string
}

export type UserCoordinates = {
  latitude: string
  longitude: string
}

export type UserTimezone = {
  offset: string
  description: string
}

export type UserLocation = {
  street: UserStreet
  city: string
  state: string
  country: string
  postcode: string | number
  coordinates: UserCoordinates
  timezone: UserTimezone
}

export type User = {
  gender: string
  name: UserName
  location: UserLocation
  email: string
  login: UserLogin
  dob: UserDOB
  registered: UserRegistered
  phone: string
  cell: string
  id: UserID
  picture: UserPicture
  nat: string
}

export type RandomUserApiResponse = {
  results: User[]
  info: {
    seed: string
    results: number
    page: number
    version: string
  }
}

export type UserMinimal = Pick<User, 'login' | 'name' | 'email' | 'id' | 'picture'>
export type UserExpanded = Pick<User, 'login' | 'name' | 'email' | 'id' | 'picture' | 'location'>
export type UserType = 'minimal' | 'expanded' | 'all'
