export const LEGAL_EFFECTIVE_DATE = "2026-10-14";

export interface LegalInfo {
  operatorName: string | null;
  operatorAddress: string | null;
  operatorTaxId: string | null;
  contactEmail: string | null;
  /** Name, address and e-mail are all set. */
  complete: boolean;
}

/** Seller / data controller details, kept in environment variables rather than in the repository. */
export function getLegalInfo(): LegalInfo {
  const operatorName = process.env.LEGAL_OPERATOR_NAME?.trim() || null;
  const operatorAddress = process.env.LEGAL_OPERATOR_ADDRESS?.trim() || null;
  const operatorTaxId = process.env.LEGAL_OPERATOR_TAX_ID?.trim() || null;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
  return {
    operatorName,
    operatorAddress,
    operatorTaxId,
    contactEmail,
    complete: Boolean(operatorName && operatorAddress && contactEmail),
  };
}
