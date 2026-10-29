import { NextRequest, NextResponse } from "next/server";
import { prisma, isPlaceholderDb } from "@/server/db";
import { z } from "zod";
import { decideScan } from "@/lib/domain/scanner";

const syncSchema = z.object({
  deviceId: z.string().min(1),
  eventId: z.string().min(1),
  scans: z
    .array(
      z.object({
        code: z.string().min(1),
        clientScanId: z.string().min(1),
        scannedAt: z.string(),
      })
    )
    .max(100),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = syncSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sync batch payload",
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { deviceId, eventId, scans } = parseResult.data;
    const results = [];

    if (isPlaceholderDb()) {
      const globalAny = globalThis as any;
      if (!globalAny.__syncMemoryLogs) {
        globalAny.__syncMemoryLogs = new Map<string, any>();
      }

      for (const scan of scans) {
        const key = `${deviceId}:${scan.clientScanId}`;
        if (globalAny.__syncMemoryLogs.has(key)) {
          results.push({
            clientScanId: scan.clientScanId,
            result: globalAny.__syncMemoryLogs.get(key).result,
            duplicate: true,
          });
          continue;
        }

        const decision = decideScan({
          code: scan.code,
          scannerEventId: eventId,
          ticketRecord: {
            id: scan.code.split(".")[1] || "tkt_sync",
            eventId,
            status: "VALID",
          },
        });

        globalAny.__syncMemoryLogs.set(key, { result: decision.result });
        results.push({
          clientScanId: scan.clientScanId,
          result: decision.result,
          conflict: false,
        });
      }

      return NextResponse.json({ results });
    }

    for (const scan of scans) {
      // Idempotent duplicate check on (deviceId, clientScanId) (AC-F9-7)
      let existingLog: any = null;
      try {
        existingLog = await prisma.scanLog.findFirst({
          where: { deviceId, clientScanId: scan.clientScanId },
        });
      } catch (e) {
        existingLog = null;
      }

      if (existingLog) {
        results.push({
          clientScanId: scan.clientScanId,
          result: existingLog.result,
          duplicate: true,
        });
        continue;
      }

      let ticket: any = null;
      try {
        ticket = await prisma.ticket.findUnique({
          where: { code: scan.code },
        });
      } catch (e) {
        ticket = null;
      }

      let conflict = false;
      if (ticket && ticket.status === "USED" && ticket.usedByDeviceId !== deviceId) {
        conflict = true;
      }

      const decision = decideScan({
        code: scan.code,
        scannerEventId: eventId,
        ticketRecord: ticket,
      });

      const finalResult = conflict ? "ALREADY_USED" : decision.result;

      const scanDate = isNaN(Date.parse(scan.scannedAt)) ? new Date() : new Date(scan.scannedAt);

      if (!conflict && decision.result === "ADMITTED" && ticket) {
        try {
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
              status: "USED",
              usedAt: scanDate,
              usedByDeviceId: deviceId,
            },
          });
        } catch (e) {}
      }

      try {
        await prisma.scanLog.create({
          data: {
            eventId,
            ticketId: ticket?.id,
            code: scan.code,
            deviceId,
            clientScanId: scan.clientScanId,
            result: finalResult,
            scannedAt: scanDate,
            source: "OFFLINE_SYNC",
          },
        });
      } catch (e) {}

      results.push({
        clientScanId: scan.clientScanId,
        result: finalResult,
        conflict,
        usedByDevice: conflict ? ticket?.usedByDeviceId : undefined,
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to process scan sync batch",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
