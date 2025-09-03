// Consent and Terms & Conditions utilities
export type TcSnapshot = {
  hasTc: boolean;
  name?: string | undefined;
  email?: string | undefined;
  companyDomain?: string | undefined;
  policyVersion?: string | undefined;
};

type ConsentCookie = {
  allow: boolean;
  allowedDomains: string[];
  ts: number;
  policyVersion?: string;
  name?: string;
  email?: string;
  companyDomain?: string;
};

export function readTcFromCookie(cookieVal?: string | null): TcSnapshot {
  if (!cookieVal) return { hasTc: false };
  try {
    const v = JSON.parse(cookieVal) as ConsentCookie;
    return {
      hasTc: !!v.allow,
      name: v.name,
      email: v.email,
      companyDomain: v.companyDomain || v.allowedDomains?.[0],
      policyVersion: v.policyVersion,
    };
  } catch { return { hasTc: false } }
}
