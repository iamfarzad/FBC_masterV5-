export interface RawPersonInput {
  text?: string
  name?: string
  company?: string
  profileUrl?: string
}

export interface NormalizedPerson {
  fullName: string
  role?: string
  seniority?: string
  profileUrl?: string
  company?: string
}

export function normalizePerson(p: {
  fullName?: string;
  role?: string;
  seniority?: string | null;
  profileUrl?: string | null;
  company?: string;
}): NormalizedPerson {
  return {
    fullName: p.fullName ?? '',
    role: p.role,
    seniority: p.seniority ?? undefined,
    profileUrl: p.profileUrl ?? undefined,
    company: p.company
  }
}

function extractRole(text?: string | null): string | null {
  if (!text) return null
  const m = text.match(/(cto|ceo|founder|vp engineering|head of [^,\n]+)/i)
  return m ? m[1] : null
}

export function extractLinkedInProfile(url: string): string | null {
  const m = /https?:\/\/([\w.]*linkedin\.com\/in\/[^\/?#]+)/i.exec(url)
  return m ? m[1] : null
}


