import { z } from 'zod';
export const password = z
  .string()
  .min(8)
  .max(128)
  .regex(/[0-9]/, 'Include a number')
  .regex(/[^a-zA-Z0-9]/, 'Include a symbol');
export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    nic: z.string().regex(/^(?:\d{12}|\d{9}[vVxX])$/),
    phone: z.string().regex(/^\+?\d{9,15}$/),
    password,
    consent: z.literal(true),
  })
  .strict();
export const loginSchema = z
  .object({
    login: z.string().min(2).max(100),
    password: z.string().min(1).max(128),
    rememberDevice: z.boolean().optional(),
  })
  .strict();
export const reportSchema = z
  .object({
    category: z.enum([
      'CYBER_HARASSMENT',
      'DOMESTIC_VIOLENCE',
      'WORKPLACE_HARASSMENT',
      'PUBLIC_TRANSPORT_ABUSE',
    ]),
    occurredAt: z.string().datetime(),
    description: z.string().max(10000).default(''),
    anonymous: z.boolean(),
    evidenceIds: z.array(z.string().uuid()).max(20).default([]),
    locationEventIds: z.array(z.string().uuid()).max(50).default([]),
    position: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        accuracy: z.number().nonnegative().max(100000),
        capturedAt: z.string().datetime(),
      })
      .optional(),
    idempotencyKey: z.string().uuid(),
  })
  .strict();
export const positionSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().nonnegative().max(100000),
    capturedAt: z.string().datetime(),
  })
  .strict();
export const messageSchema = z.object({ body: z.string().trim().min(1).max(10000) }).strict();
export const contactSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    relationship: z.string().trim().min(1).max(50),
    phone: z.string().regex(/^\+?\d{9,15}$/),
    priority: z.boolean().default(false),
  })
  .strict();
