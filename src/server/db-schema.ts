export const POSTGRES_SCHEMA_STATEMENTS: string[] = [
  `CREATE SCHEMA IF NOT EXISTS "public";`,

  // Enums
  `DO $$ BEGIN CREATE TYPE "EventCategory" AS ENUM ('MUSIC', 'TECH', 'SPORTS', 'COMEDY', 'FOOD', 'ART'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "EventStatus" AS ENUM ('PUBLISHED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('CONFIRMED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "TicketStatus" AS ENUM ('VALID', 'USED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "ScanResult" AS ENUM ('ADMITTED', 'ALREADY_USED', 'INVALID', 'WRONG_EVENT', 'TICKET_CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "ScanSource" AS ENUM ('ONLINE', 'OFFLINE_SYNC'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // Tables
  `CREATE TABLE IF NOT EXISTS "Guest" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
  );`,

  `CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "city" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PUBLISHED',
    "coverSeed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
  );`,

  `CREATE TABLE IF NOT EXISTS "TicketTier" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePaise" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "maxPerOrder" INTEGER NOT NULL DEFAULT 6,
    CONSTRAINT "TicketTier_pkey" PRIMARY KEY ("id")
  );`,

  `CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CONFIRMED',
    "totalPaise" INTEGER NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "paymentRef" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
  );`,

  `CREATE TABLE IF NOT EXISTS "Ticket" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'VALID',
    "usedAt" TIMESTAMP(3),
    "usedByDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
  );`,

  `CREATE TABLE IF NOT EXISTS "ScanLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketId" TEXT,
    "code" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "clientScanId" TEXT,
    "result" "ScanResult" NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "ScanSource" NOT NULL,
    CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
  );`,

  `CREATE TABLE IF NOT EXISTS "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
  );`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS "Guest_createdAt_idx" ON "Guest"("createdAt");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");`,
  `CREATE INDEX IF NOT EXISTS "Event_startsAt_idx" ON "Event"("startsAt");`,
  `CREATE INDEX IF NOT EXISTS "Event_status_startsAt_idx" ON "Event"("status", "startsAt");`,
  `CREATE INDEX IF NOT EXISTS "Event_city_idx" ON "Event"("city");`,
  `CREATE INDEX IF NOT EXISTS "Event_category_idx" ON "Event"("category");`,
  `CREATE INDEX IF NOT EXISTS "TicketTier_eventId_idx" ON "TicketTier"("eventId");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Order_idempotencyKey_key" ON "Order"("idempotencyKey");`,
  `CREATE INDEX IF NOT EXISTS "Order_guestId_idx" ON "Order"("guestId");`,
  `CREATE INDEX IF NOT EXISTS "Order_eventId_idx" ON "Order"("eventId");`,
  `CREATE INDEX IF NOT EXISTS "Order_idempotencyKey_idx" ON "Order"("idempotencyKey");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_code_key" ON "Ticket"("code");`,
  `CREATE INDEX IF NOT EXISTS "Ticket_guestId_idx" ON "Ticket"("guestId");`,
  `CREATE INDEX IF NOT EXISTS "Ticket_eventId_status_idx" ON "Ticket"("eventId", "status");`,
  `CREATE INDEX IF NOT EXISTS "Ticket_orderId_idx" ON "Ticket"("orderId");`,
  `CREATE INDEX IF NOT EXISTS "Ticket_tierId_idx" ON "Ticket"("tierId");`,
  `CREATE INDEX IF NOT EXISTS "ScanLog_eventId_idx" ON "ScanLog"("eventId");`,
  `CREATE INDEX IF NOT EXISTS "ScanLog_scannedAt_idx" ON "ScanLog"("scannedAt");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ScanLog_deviceId_clientScanId_key" ON "ScanLog"("deviceId", "clientScanId");`,
  `CREATE INDEX IF NOT EXISTS "RateLimit_key_idx" ON "RateLimit"("key");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "RateLimit_key_windowStart_key" ON "RateLimit"("key", "windowStart");`,

  // Foreign keys
  `DO $$ BEGIN ALTER TABLE "TicketTier" ADD CONSTRAINT "TicketTier_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "Order" ADD CONSTRAINT "Order_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "Order" ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "TicketTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
];

export async function ensurePostgresSchema(prismaClient: any): Promise<void> {
  if (typeof prismaClient.$executeRawUnsafe !== "function") {
    return;
  }

  for (const statement of POSTGRES_SCHEMA_STATEMENTS) {
    try {
      await prismaClient.$executeRawUnsafe(statement);
    } catch (err) {
      console.warn("Schema initialization statement error (continuing):", err);
    }
  }
}
