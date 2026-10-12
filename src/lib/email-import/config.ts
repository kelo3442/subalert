export interface InboundConfig {
  /** Address template with a {token} placeholder, e.g. "{token}@in.subalert.pl". */
  addressTemplate: string;
}

export function getInboundConfig(): InboundConfig | null {
  const addressTemplate = process.env.INBOUND_EMAIL_ADDRESS;
  if (!addressTemplate?.includes("{token}") || !process.env.INBOUND_EMAIL_WEBHOOK_SECRET) return null;
  return { addressTemplate };
}

export function inboundAddress(config: InboundConfig, token: string): string {
  return config.addressTemplate.replace("{token}", token);
}
