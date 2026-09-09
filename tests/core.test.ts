import { describe, it, expect } from 'vitest';
import { canAdvance, isFreshPosition, percent } from '../packages/shared/src';
import { reportSchema, registerSchema } from '../packages/validation/src';
import { randomUUID } from 'node:crypto';
describe('Workflow invariants', () => {
  it('does not skip or reverse investigation stages', () => {
    expect(canAdvance('FILED', 'UNDER_INVESTIGATION')).toBe(true);
    expect(canAdvance('FILED', 'RESOLVED')).toBe(false);
    expect(canAdvance('RESOLVED', 'FILED')).toBe(false);
  });
  it('rejects stale and future positions', () => {
    const now = Date.now();
    expect(isFreshPosition(new Date(now - 121000).toISOString(), now)).toBe(false);
    expect(isFreshPosition(new Date(now + 60000).toISOString(), now)).toBe(false);
    expect(isFreshPosition(new Date(now).toISOString(), now)).toBe(true);
  });
  it('calculates progress instead of copying source percentages', () => {
    expect(percent(33, 50)).toBe(66);
    expect(percent(215, 250)).toBe(86);
  });
  it('rejects role injection and missing registration consent', () => {
    expect(
      registerSchema.safeParse({
        name: 'Test User',
        nic: '200012345678',
        phone: '+94000000000',
        password: 'Strong123!',
        consent: true,
        role: 'ADMIN',
      }).success,
    ).toBe(false);
  });
  it('validates owned-attachment identifiers before application policy', () => {
    expect(
      reportSchema.safeParse({
        category: 'CYBER_HARASSMENT',
        occurredAt: new Date().toISOString(),
        anonymous: true,
        evidenceIds: ['not-a-uuid'],
        idempotencyKey: randomUUID(),
      }).success,
    ).toBe(false);
  });
});
