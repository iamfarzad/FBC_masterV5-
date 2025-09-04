export interface RawCompanyInput {
  text?: string
  url?: string
  title?: string
}

export interface NormalizedCompany {
  name: string
  domain: string
  industry?: string
  size?: string
  summary?: string
  website?: string
  linkedin?: string
}

export function normalizeCompany(input: { name?: string; url?: string }): NormalizedCompany {
  const { name, url } = input
  return { name: name ?? '', url: url ?? '' }
}


