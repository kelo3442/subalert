export const LEGAL_EFFECTIVE_DATE = "2026-10-18";

export interface LegalInfo {
  operatorName: string | null;
  operatorAddress: string | null;
  operatorTaxId: string | null;
  contactEmail: string | null;
  /** Name and e-mail are set (the postal address is optional until Premium is sold). */
  complete: boolean;
}

const DEFAULT_OPERATOR_NAME = "Olivier Cisoń";
const DEFAULT_CONTACT_EMAIL = "kontakt@oplacik.pl";

/** Seller / data controller details; environment variables override the defaults. */
export function getLegalInfo(): LegalInfo {
  const operatorName = process.env.LEGAL_OPERATOR_NAME?.trim() || DEFAULT_OPERATOR_NAME;
  const operatorAddress = process.env.LEGAL_OPERATOR_ADDRESS?.trim() || null;
  const operatorTaxId = process.env.LEGAL_OPERATOR_TAX_ID?.trim() || null;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;
  return {
    operatorName,
    operatorAddress,
    operatorTaxId,
    contactEmail,
    complete: Boolean(operatorName && contactEmail),
  };
}
