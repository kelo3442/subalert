// Matches a payment name to a cancel guide on /jak-anulowac. Order matters: Apple Music before App Store.
const GUIDES: [RegExp, string][] = [
  [/netflix/i, "netflix"],
  [/spotify/i, "spotify"],
  [/youtube/i, "youtube-premium"],
  [/apple music/i, "apple-music"],
  [/app store|apple\.com|icloud/i, "iphone"],
  [/google play/i, "google-play"],
  [/disney/i, "disney-plus"],
  [/hbo/i, "hbo-max"],
  [/amazon|prime video/i, "amazon-prime"],
  [/canal\s?\+/i, "canal-plus"],
  [/^player\b/i, "player"],
  [/skyshowtime/i, "skyshowtime"],
  [/tidal/i, "tidal"],
];

export function cancelGuideSlug(name: string): string | null {
  return GUIDES.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}
