import {
  EmergencyDeliveryProvider,
  DevelopmentEmergencyDelivery,
  SafeRouteProvider,
  DevelopmentSafeRoute,
} from './safety/providers';
import './core/env';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { Db } from './core/db';
import { CryptoService } from './core/crypto';
import { AuthController, AuthGuard, AuthService } from './auth/auth';
import { CaseController, CaseService } from './cases/cases';
import { EvidenceController, EvidenceService, ObjectStore } from './evidence/evidence';
import { SafetyController } from './safety/safety';
import { LegalController } from './support/legal';
import { CounselingController } from './support/counseling';
import { CommunityController } from './community/community';
import { AdminController } from './admin/admin';
import { MeController } from './core/me';
import { AnalysisController } from './support/analysis';
import { required } from './core/env';
@Module({
  imports: [
    JwtModule.registerAsync({ useFactory: () => ({ secret: required('JWT_SECRET') }) }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
  ],
  controllers: [
    AuthController,
    CaseController,
    EvidenceController,
    SafetyController,
    LegalController,
    CounselingController,
    CommunityController,
    AdminController,
    MeController,
    AnalysisController,
  ],
  providers: [
    Db,
    CryptoService,
    AuthService,
    CaseService,
    EvidenceService,
    ObjectStore,
    { provide: EmergencyDeliveryProvider, useClass: DevelopmentEmergencyDelivery },
    { provide: SafeRouteProvider, useClass: DevelopmentSafeRoute },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
