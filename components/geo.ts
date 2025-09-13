export function milesBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const KNOWN_CENTERS = [
  { label: "Effingham, IL", lat: 39.1200, lon: -88.5434 },
  { label: "Mattoon, IL", lat: 39.4831, lon: -88.3728 },
  { label: "Charleston, IL", lat: 39.4960, lon: -88.1761 }
];
