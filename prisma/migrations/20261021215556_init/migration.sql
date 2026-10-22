-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'applicant',
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    CONSTRAINT "Project_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransportRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicle" TEXT NOT NULL,
    "rate" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "TransportInstruction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registration" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "TransportRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "completedAt" DATETIME,
    "applicantName" TEXT NOT NULL,
    "applicantBranchId" TEXT NOT NULL,
    "applicantPhone" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "applicantProjectId" TEXT NOT NULL,
    "applicantCostCenterId" TEXT NOT NULL,
    "travelDate" DATETIME NOT NULL,
    "departureTime" TEXT NOT NULL,
    "passengerCount" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransportRequest_applicantBranchId_fkey" FOREIGN KEY ("applicantBranchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransportRequest_applicantProjectId_fkey" FOREIGN KEY ("applicantProjectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransportRequest_applicantCostCenterId_fkey" FOREIGN KEY ("applicantCostCenterId") REFERENCES "CostCenter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransportRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "Passenger_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicantDeclaration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL,
    "applicantName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "signatureId" TEXT,
    CONSTRAINT "ApplicantDeclaration_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApplicantDeclaration_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Signature" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "comment" TEXT,
    "fundsAvailable" BOOLEAN,
    "project" TEXT,
    "costCenter" TEXT,
    "branch" TEXT,
    "signatureId" TEXT,
    CONSTRAINT "Approval_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Approval_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Signature" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransportAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "instructions" TEXT,
    "vehicleName" TEXT,
    "driverName" TEXT,
    "signatureId" TEXT,
    CONSTRAINT "TransportAllocation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransportAllocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransportAllocation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransportAllocation_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Signature" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Signature_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "note" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferenceCounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registration_key" ON "Vehicle"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TransportRequest_referenceNumber_key" ON "TransportRequest"("referenceNumber");

-- CreateIndex
CREATE INDEX "TransportRequest_status_idx" ON "TransportRequest"("status");

-- CreateIndex
CREATE INDEX "TransportRequest_createdById_idx" ON "TransportRequest"("createdById");

-- CreateIndex
CREATE INDEX "TransportRequest_applicantCostCenterId_idx" ON "TransportRequest"("applicantCostCenterId");

-- CreateIndex
CREATE INDEX "TransportRequest_applicantBranchId_idx" ON "TransportRequest"("applicantBranchId");

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_requestId_position_key" ON "Passenger"("requestId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantDeclaration_requestId_key" ON "ApplicantDeclaration"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantDeclaration_signatureId_key" ON "ApplicantDeclaration"("signatureId");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_requestId_stage_key" ON "Approval"("requestId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "TransportAllocation_requestId_key" ON "TransportAllocation"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportAllocation_signatureId_key" ON "TransportAllocation"("signatureId");

-- CreateIndex
CREATE INDEX "Signature_requestId_idx" ON "Signature"("requestId");

-- CreateIndex
CREATE INDEX "AuditLog_requestId_createdAt_idx" ON "AuditLog"("requestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceCounter_year_key" ON "ReferenceCounter"("year");
