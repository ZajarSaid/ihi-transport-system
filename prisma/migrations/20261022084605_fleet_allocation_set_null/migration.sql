-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransportAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "date" DATETIME NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "instructions" TEXT,
    "vehicleName" TEXT,
    "driverName" TEXT,
    "signatureId" TEXT,
    CONSTRAINT "TransportAllocation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransportAllocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransportAllocation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransportAllocation_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Signature" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TransportAllocation" ("assignedBy", "date", "driverId", "driverName", "id", "instructions", "requestId", "signatureId", "vehicleId", "vehicleName") SELECT "assignedBy", "date", "driverId", "driverName", "id", "instructions", "requestId", "signatureId", "vehicleId", "vehicleName" FROM "TransportAllocation";
DROP TABLE "TransportAllocation";
ALTER TABLE "new_TransportAllocation" RENAME TO "TransportAllocation";
CREATE UNIQUE INDEX "TransportAllocation_requestId_key" ON "TransportAllocation"("requestId");
CREATE UNIQUE INDEX "TransportAllocation_signatureId_key" ON "TransportAllocation"("signatureId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
