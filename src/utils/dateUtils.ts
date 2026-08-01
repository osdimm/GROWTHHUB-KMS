/**
 * Dynamic relative time utility function for KMS Growth Hub notifications & activities.
 *
 * Logic:
 * - < 60 seconds: "Baru saja"
 * - < 60 minutes: "X menit yang lalu"
 * - < 24 hours: "X jam yang lalu"
 * - < 7 days: "X hari yang lalu"
 * - > 7 days: "DD MMM YYYY" (e.g., "01 Agu 2026")
 */
export const getRelativeTime = (createdAt?: number, fallbackTime?: string): string => {
  if (!createdAt || typeof createdAt !== 'number' || createdAt < 1000000000000) {
    return fallbackTime || 'Baru saja';
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - createdAt);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Baru saja';
  }
  if (diffMin < 60) {
    return `${diffMin} menit yang lalu`;
  }
  if (diffHour < 24) {
    return `${diffHour} jam yang lalu`;
  }
  if (diffDay < 7) {
    return `${diffDay} hari yang lalu`;
  }

  const d = new Date(createdAt);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};
