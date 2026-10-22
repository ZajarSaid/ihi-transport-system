-- Older allocations predate the driverPhone/driverEmail snapshot columns.
-- Fill them from the still-linked Driver row so existing printed forms show
-- contact details. Rows whose driver was already retired (driverId is NULL)
-- keep their names only and cannot be recovered.
UPDATE "TransportAllocation"
SET
  "driverPhone" = (SELECT "phone" FROM "Driver" WHERE "Driver"."id" = "TransportAllocation"."driverId"),
  "driverEmail" = (SELECT "email" FROM "Driver" WHERE "Driver"."id" = "TransportAllocation"."driverId")
WHERE
  "driverId" IS NOT NULL
  AND "driverPhone" IS NULL
  AND "driverEmail" IS NULL;
