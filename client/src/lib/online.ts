export const isRecentlyActive = (lastActive?: string, fallback?: boolean) => {
  if (fallback === false) return false;
  if (lastActive) {
    const ts = new Date(lastActive).getTime();
    if (!Number.isNaN(ts)) {
      return Date.now() - ts < 2 * 60 * 1000;
    }
  }
  return Boolean(fallback);
};
