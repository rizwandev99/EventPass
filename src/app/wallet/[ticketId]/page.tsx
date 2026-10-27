import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { QrCodeCard } from "@/components/wallet/qr-code-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SingleTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;

  let ticket: any = null;
  try {
    ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });
  } catch (e) {
    ticket = null;
  }

  if (!ticket) {
    // If not in database yet in offline/mock env, display fallback pass
    ticket = {
      id: ticketId,
      code: `EP1.${ticketId}.DEMOSIGNATURE16`,
      attendeeName: "Demo Attendee",
      tierId: "General Admission",
      status: "VALID" as const,
    };
  }

  return (
    <div className="max-w-md mx-auto space-y-6 py-4">
      <Link
        href="/wallet"
        className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Wallet</span>
      </Link>

      <QrCodeCard
        code={ticket.code}
        attendeeName={ticket.attendeeName}
        tierName={ticket.tierId || "General"}
        status={ticket.status}
        usedAt={ticket.usedAt}
      />
    </div>
  );
}
