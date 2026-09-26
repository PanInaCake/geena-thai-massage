/** All duration options shown in the booking UI (minutes). */
export const BOOKING_DURATION_MINUTES = [30, 45, 60, 90, 120] as const;
export type BookingDurationMinutes = (typeof BOOKING_DURATION_MINUTES)[number];

const SHARED_BODY_DURATIONS = [30, 45, 60] as const;

export const MASSAGE_BOOKING_PACKAGES = [
  { id: "deep-oil", label: "Deep Tissue Massage", durations: SHARED_BODY_DURATIONS },
  { id: "thai-oil", label: "Thai Oil Massage", durations: SHARED_BODY_DURATIONS },
  { id: "thai-no-oil", label: "Thai Massage", durations: SHARED_BODY_DURATIONS },
  { id: "aromatherapy-back", label: "Aroma Massage", durations: SHARED_BODY_DURATIONS },
  { id: "head", label: "Head Massage", durations: SHARED_BODY_DURATIONS },
  { id: "pregnancy", label: "Pregnancy Massage", durations: [45, 60, 90, 120] },
  { id: "neck-shoulder", label: "Back, Neck & Shoulder Massage", durations: [30, 45, 60] },
  { id: "foot", label: "Foot Massage", durations: [30, 60] },
  { id: "foot-spa-foot", label: "Foot Spa + Foot Massage", durations: [60] },
  { id: "back-scrub", label: "Back Scrub + Full Body Massage", durations: [90] },
  { id: "therapeutic", label: "Therapeutic Massage", durations: [60, 90, 120] },
  { id: "hot-stone", label: "Hot Stone Massage", durations: [90] },
  { id: "hot-herbal", label: "Hot Herbal Massage", durations: [90] },
] as const;

export type MassageBookingPackageId = (typeof MASSAGE_BOOKING_PACKAGES)[number]["id"];

const PACKAGE_ID_TUPLE = MASSAGE_BOOKING_PACKAGES.map((p) => p.id) as unknown as [
  MassageBookingPackageId,
  ...MassageBookingPackageId[],
];

/** For Zod `z.enum(...)`. */
export const BOOKING_PACKAGE_IDS = PACKAGE_ID_TUPLE;

export function getMassageBookingPackage(id: string) {
  return MASSAGE_BOOKING_PACKAGES.find((p) => p.id === id);
}

export function massagePackageAllowsDuration(pkg: (typeof MASSAGE_BOOKING_PACKAGES)[number], minutes: number) {
  return (pkg.durations as readonly number[]).includes(minutes);
}

export function formatBookingPackageForDb(packageId: MassageBookingPackageId, durationMinutes: number): string {
  const pkg = getMassageBookingPackage(packageId);
  if (!pkg) throw new Error("Invalid package id");
  return `${pkg.label} (${durationMinutes} min)`;
}

/** Price in NZD for each package + duration (matches Packages page). */
const SHARED_BODY_PRICES = { 30: 60, 45: 80, 60: 95 };

export const BOOKING_PACKAGE_PRICES: Record<MassageBookingPackageId, Partial<Record<number, number>>> = {
  "deep-oil": SHARED_BODY_PRICES,
  "thai-oil": SHARED_BODY_PRICES,
  "thai-no-oil": SHARED_BODY_PRICES,
  "aromatherapy-back": SHARED_BODY_PRICES,
  "head": SHARED_BODY_PRICES,
  pregnancy: { 45: 80, 60: 95, 90: 140, 120: 170 },
  "neck-shoulder": { 30: 60, 45: 80, 60: 100 },
  foot: { 30: 60, 60: 100 },
  "foot-spa-foot": { 60: 120 },
  "back-scrub": { 90: 170 },
  therapeutic: { 60: 110, 90: 150, 120: 190 },
  "hot-stone": { 90: 155 },
  "hot-herbal": { 90: 155 },
};

export function getBookingPrice(
  packageId: MassageBookingPackageId,
  durationMinutes: number,
): number | null {
  return BOOKING_PACKAGE_PRICES[packageId]?.[durationMinutes] ?? null;
}

export function formatBookingPrice(amount: number): string {
  return `$${amount}`;
}
