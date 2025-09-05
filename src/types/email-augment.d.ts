// ===============================================
// File: src/types/email-augment.d.ts (NEW)
// Why: Terminal shows `EmailTemplate.text` missing; augment your app's template contract.
// ===============================================
declare module '@/src/core/email-service' {
  export interface EmailTemplate {
    text?: string;
  }
}
