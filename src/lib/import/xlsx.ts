/**
 * Minimal reader for Excel .xlsx files (a ZIP of XML parts), enough to turn the
 * first worksheet of a bank export into rows of text. Runs in the browser, so
 * the file still never leaves the device.
 */

const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0];

const startsWith = (bytes: Uint8Array, signature: number[]) => signature.every((byte, i) => bytes[i] === byte);

/** .xlsx (and other Office Open XML files) are ZIP archives. */
export const isZipFile = (bytes: Uint8Array) => startsWith(bytes, ZIP_SIGNATURE);
/** Old binary Excel (.xls) and Word files. */
export const isLegacyOfficeFile = (bytes: Uint8Array) => startsWith(bytes, OLE_SIGNATURE);
export const isPdfFile = (bytes: Uint8Array) => startsWith(bytes, [0x25, 0x50, 0x44, 0x46]);

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Reads the files of a ZIP archive whose names match `wanted`. */
async function readZip(bytes: Uint8Array, wanted: (name: string) => boolean): Promise<Map<string, string>> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end === -1) throw new Error("not a zip");
  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  const decoder = new TextDecoder("utf-8");
  const files = new Map<string, string>();
  for (let n = 0; n < count; n += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error("bad zip");
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
    if (!wanted(name)) continue;
    const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    const raw = bytes.subarray(dataStart, dataStart + compressedSize);
    if (method !== 0 && method !== 8) throw new Error("unsupported compression");
    files.set(name, decoder.decode(method === 0 ? raw : await inflate(raw)));
  }
  return files;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
function decodeXml(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) => {
    if (entity[0] === "#") return String.fromCodePoint(entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
    return ENTITIES[entity.toLowerCase()];
  });
}

/** Concatenates the <t> runs inside a shared string or inline string. */
const textRuns = (xml: string) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => decodeXml(m[1])).join("");

function columnIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? "A";
  return [...letters].reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

/** Excel stores money as floats ("-23.990000000000002"); keep two decimals. */
function formatNumber(value: string): string {
  return /^-?\d+\.\d{3,}$/.test(value) ? Number(value).toFixed(2) : value;
}

/** Rows of the first worksheet as text. Dates stored as numbers stay Excel serial numbers. */
export async function xlsxToRows(bytes: Uint8Array): Promise<string[][]> {
  const files = await readZip(bytes, (name) => name === "xl/sharedStrings.xml" || /^xl\/worksheets\/sheet\d+\.xml$/.test(name));
  const sheetName = [...files.keys()]
    .filter((name) => name.startsWith("xl/worksheets/"))
    .sort((a, b) => Number(/\d+/.exec(a.slice(14))?.[0]) - Number(/\d+/.exec(b.slice(14))?.[0]))[0];
  if (!sheetName) throw new Error("no worksheet");
  const shared = [...(files.get("xl/sharedStrings.xml") ?? "").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textRuns(m[1]));

  const rows: string[][] = [];
  for (const rowMatch of files.get(sheetName)!.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row: string[] = [];
    for (const cell of rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cell[1];
      const body = cell[2] ?? "";
      const ref = /\br="([A-Z]+\d+)"/.exec(attributes)?.[1];
      const type = /\bt="(\w+)"/.exec(attributes)?.[1];
      const value = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let text = "";
      if (type === "s" && value !== undefined) text = shared[Number(value)] ?? "";
      else if (type === "inlineStr") text = textRuns(body);
      else if (value !== undefined) text = type === "str" || type === "b" ? decodeXml(value) : formatNumber(value);
      const index = ref ? columnIndex(ref) : row.length;
      while (row.length < index) row.push("");
      row[index] = text;
    }
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  return rows;
}
