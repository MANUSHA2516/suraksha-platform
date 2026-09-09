import { Injectable } from '@nestjs/common';
import type { DangerZone } from '@prisma/client';
import type { Position } from '@suraksha/types';
export abstract class EmergencyDeliveryProvider {
  abstract readonly mode: string;
  abstract prepare(
    contactLabels: string[],
  ): { recipientLabel: string; mode: string; status: string }[];
}
@Injectable()
export class DevelopmentEmergencyDelivery extends EmergencyDeliveryProvider {
  readonly mode = 'development';
  prepare(contactLabels: string[]) {
    return [...contactLabels, 'Development Police console'].map((recipientLabel) => ({
      recipientLabel,
      mode: this.mode,
      status: 'DEVELOPMENT_RECORDED',
    }));
  }
}
export abstract class SafeRouteProvider {
  abstract plan(
    origin: Position,
    destination: Position,
    zones: DangerZone[],
  ): Promise<{
    provider: string;
    validatedSafe: boolean;
    notice: string;
    points: Position[];
    zones: DangerZone[];
  }>;
}
@Injectable()
export class DevelopmentSafeRoute extends SafeRouteProvider {
  async plan(origin: Position, destination: Position, zones: DangerZone[]) {
    return {
      provider: 'development',
      validatedSafe: false,
      notice: 'Illustrative route only; real safe routing is not configured',
      points: [origin, destination],
      zones,
    };
  }
}
