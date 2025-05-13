import Papa from 'papaparse'
import yaml from 'js-yaml'
import { XMLParser } from 'fast-xml-parser'
import type { User, UserMinimal, UserExpanded } from '../types/randomUser'

function mapCsvRowToUser(row: Record<string, string>): UserMinimal | UserExpanded | User {
  return {
    gender: row.gender ?? '',
    name: {
      title: row['name.title'] ?? '',
      first: row['name.first'] ?? '',
      last: row['name.last'] ?? '',
    },
    location: {
      street: {
        number: Number(row['location.street.number'] ?? 0),
        name: row['location.street'] ?? '',
      },
      city: row['location.city'] ?? '',
      state: row['location.state'] ?? '',
      country: row['location.country'] ?? '',
      postcode: row['location.postcode'] ?? '',
      coordinates: {
        latitude: row['location.coordinates.latitude'] ?? '',
        longitude: row['location.coordinates.longitude'] ?? '',
      },
      timezone: {
        offset: row['location.timezone.offset'] ?? '',
        description: row['location.timezone.description'] ?? '',
      },
    },
    email: row.email ?? '',
    login: {
      uuid: row['login.uuid'] ?? '',
      username: row['login.username'] ?? '',
      password: row['login.password'] ?? '',
      salt: row['login.salt'] ?? '',
      md5: row['login.md5'] ?? '',
      sha1: row['login.sha1'] ?? '',
      sha256: row['login.sha256'] ?? '',
    },
    id: {
      name: row['id.name'] ?? '',
      value: row['id.value'] ?? null,
    },
    picture: {
      large: row['picture.large'] ?? '',
      medium: row['picture.medium'] ?? '',
      thumbnail: row['picture.thumbnail'] ?? '',
    },
    // Add other required fields with defaults if needed (dob, registered, phone, cell, nat)
  }
}

type XmlUser = {
  gender?: string
  name?: {
    title?: string
    first?: string
    last?: string
  }
  location?: {
    street?: {
      number?: string
      name?: string
    }
    city?: string
    state?: string
    country?: string
    postcode?: string
    coordinates?: {
      latitude?: string
      longitude?: string
    }
    timezone?: {
      offset?: string
      description?: string
    }
  }
  email?: string
  login?: {
    uuid?: string
    username?: string
    password?: string
    salt?: string
    md5?: string
    sha1?: string
    sha256?: string
  }
  id?: {
    name?: string
    value?: string
  }
  picture?: {
    large?: string
    medium?: string
    thumbnail?: string
  }
  nat?: string
}

export async function parseUserData(
  data: string,
  format: 'csv' | 'yaml' | 'xml'
): Promise<Array<UserMinimal | UserExpanded | User>> {
  if (format === 'csv') {
    const parsed = Papa.parse<Record<string, string>>(data, { header: true })
    return parsed.data.map(mapCsvRowToUser)
  }
  if (format === 'yaml') {
    const doc = yaml.load(data) as { results?: Array<UserMinimal | UserExpanded | User> }
    if (doc && typeof doc === 'object' && 'results' in doc && Array.isArray(doc.results)) {
      return doc.results
    }
    throw new Error('Invalid YAML structure')
  }
  if (format === 'xml') {
    const parser = new XMLParser({ ignoreAttributes: false })
    const doc = parser.parse(data)
    const results = doc.user?.results
    if (!results) throw new Error('Invalid XML structure')
    const users: XmlUser[] = Array.isArray(results) ? results : [results]
    return users.map((u): UserMinimal | UserExpanded | User => ({
      gender: u.gender ?? '',
      name: {
        title: u.name?.title ?? '',
        first: u.name?.first ?? '',
        last: u.name?.last ?? '',
      },
      location: {
        street: {
          number: Number(u.location?.street?.number ?? 0),
          name: u.location?.street?.name ?? '',
        },
        city: u.location?.city ?? '',
        state: u.location?.state ?? '',
        country: u.location?.country ?? '',
        postcode: u.location?.postcode ?? '',
        coordinates: {
          latitude: u.location?.coordinates?.latitude ?? '',
          longitude: u.location?.coordinates?.longitude ?? '',
        },
        timezone: {
          offset: u.location?.timezone?.offset ?? '',
          description: u.location?.timezone?.description ?? '',
        },
      },
      email: u.email ?? '',
      login: {
        uuid: u.login?.uuid ?? '',
        username: u.login?.username ?? '',
        password: u.login?.password ?? '',
        salt: u.login?.salt ?? '',
        md5: u.login?.md5 ?? '',
        sha1: u.login?.sha1 ?? '',
        sha256: u.login?.sha256 ?? '',
      },
      id: {
        name: u.id?.name ?? '',
        value: u.id?.value ?? '',
      },
      picture: {
        large: u.picture?.large ?? '',
        medium: u.picture?.medium ?? '',
        thumbnail: u.picture?.thumbnail ?? '',
      },
      nat: u.nat ?? '',
    }))
  }
  return []
}

// Helper to get per-user raw data for each format
export function getUserRawData(format: string, raw: string | null, userIdx: number): string | null {
  if (!raw) return null
  switch (format) {
    case 'xml':
      return getUserXml(raw, userIdx)
    case 'csv':
      return getUserCsv(raw, userIdx)
    case 'yaml':
      return getUserYaml(raw, userIdx)
    default:
      return raw
  }
}

export function getUserXml(rawXml: string, idx: number): string | null {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return null
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(rawXml, 'application/xml')
    const resultsNodes = xmlDoc.getElementsByTagName('results')
    if (resultsNodes && resultsNodes[idx]) {
      return resultsNodes[idx].outerHTML
    }
  } catch {
    // ignore parse errors
  }
  return null
}

export function getUserCsv(rawCsv: string, idx: number): string | null {
  const lines = rawCsv.trim().split('\n')
  if (lines.length < 2) return null
  const header = lines[0]
  const row = lines[idx + 1] // +1 to skip header
  return row ? `${header}\n${row}` : null
}

export function getUserYaml(rawYaml: string, idx: number): string | null {
  try {
    const doc = yaml.load(rawYaml) as { results?: unknown[] }
    if (doc && Array.isArray(doc.results) && doc.results[idx]) {
      return yaml.dump([doc.results[idx]], { lineWidth: -1 })
    }
  } catch {
    // ignore parse errors
  }
  return null
}
