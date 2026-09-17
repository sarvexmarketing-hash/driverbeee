export function isWarangalLocation(locationStr: string): boolean {
  if (!locationStr) return false;
  const q = locationStr.toLowerCase().trim();
  return (
    q.includes('warangal') ||
    q.includes('hanamkonda') ||
    q.includes('hanumakonda') ||
    q.includes('kazipet') ||
    q.includes('subedari') ||
    q.includes('nakkalagutta') ||
    q.includes('hunter road') ||
    q.includes('waddepally') ||
    q.includes('balasamudram') ||
    q.includes('pochamma') ||
    q.includes('kishanpura') ||
    q.includes('mandi bazar') ||
    q.includes('kakatiya') ||
    q.includes('ramnagar')
  );
}

export function getCityDisplayName(locationStr: string): string {
  if (!locationStr) return 'Your Location';
  return locationStr.split(',')[0].trim();
}
