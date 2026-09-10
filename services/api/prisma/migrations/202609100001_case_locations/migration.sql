-- Link consented location points to a filed case for police investigation trails.
ALTER TABLE "LocationEvent" ADD COLUMN "caseId" TEXT;

ALTER TABLE "LocationEvent" ADD CONSTRAINT "LocationEvent_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "LocationEvent_caseId_capturedAt_idx" ON "LocationEvent"("caseId", "capturedAt");
