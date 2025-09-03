import { describe, it, expect } from 'vitest';
import { computeMonthlyCounts } from '../../backend/services/stats';

describe('computeMonthlyCounts', () => {
  it('returns 12 months with counts', () => {
    const now = new Date();
    const items = [
      { createdAt: now },
      { createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 35) },
    ];
    const out = computeMonthlyCounts(items);
    expect(out).toHaveLength(12);
    const total = out.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(2);
  });
});

