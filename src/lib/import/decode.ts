/**
 * Polish banks export CSV either as UTF-8 or Windows-1250. Invalid UTF-8
 * (replacement characters) means the legacy code page.
 */
export function decodeBankFile(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  const text = utf8.includes("�") ? new TextDecoder("windows-1250").decode(bytes) : utf8;
  return text.replace(/^﻿/, "");
}
