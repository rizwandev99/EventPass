import { prisma, isPlaceholderDb } from "./db";
import { mockDb } from "./mock-db";
import { ensurePostgresSchema } from "./db-schema";
import { EventCategory, EventStatus } from "@prisma/client";
import { generateTicketCode } from "@/lib/domain/booking";

export async function resetAndSeedDatabase(): Promise<{
  success: boolean;
  mode: "mock" | "neon";
  message: string;
}> {
  if (isPlaceholderDb()) {
    mockDb.reset();
    return {
      success: true,
      mode: "mock",
      message: "In-memory database reset to initial seed data successfully.",
    };
  }

  // 1. Ensure all tables, enums, indexes and constraints exist in PostgreSQL
  await ensurePostgresSchema(prisma);

  // 2. Clean existing database rows idempotently
  await prisma.scanLog.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.ticketTier.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.guest.deleteMany({});
  await prisma.rateLimit.deleteMany({});

  const now = new Date();
  const days = (d: number, hours = 0) =>
    new Date(now.getTime() + (d * 24 + hours) * 60 * 60 * 1000);

  const events = [
    // 1. Starting Soon (<24h) - Scanner Demo Event
    {
      slug: "delhi-live-indie-music-nights",
      title: "Delhi Live: Indie Music & Acoustic Nights",
      description:
        "An intimate evening featuring five breakthrough independent indie artists from across the country. Experience soulful acoustic performances under the autumn sky with cozy seating and craft mocktails.",
      category: EventCategory.MUSIC,
      city: "Delhi",
      venueName: "The Piano Man Jazz Club",
      address: "Commercial Complex B 6/7-22, Safdarjung Enclave, New Delhi",
      startsAt: days(0, 4),
      endsAt: days(0, 8),
      status: EventStatus.PUBLISHED,
      coverSeed: "delhi-indie-acoustic-01",
      tiers: [
        { name: "Early Bird", description: "Standard entry with complimentary drink", pricePaise: 49900, capacity: 50, sold: 45, maxPerOrder: 4 },
        { name: "General Admission", description: "Access to main hall and standing pit", pricePaise: 89900, capacity: 100, sold: 20, maxPerOrder: 6 },
        { name: "VIP Pass", description: "Mezzanine lounge seating and artist meet & greet", pricePaise: 199900, capacity: 20, sold: 10, maxPerOrder: 2 },
      ],
    },

    // 2. Sold Out Event (Every tier at capacity)
    {
      slug: "bengaluru-ai-systems-summit-2026",
      title: "Bengaluru AI Systems & Autonomous Agents Summit",
      description:
        "India's premier technical conference focused on production LLM infrastructure, multi-agent frameworks, and local inference architecture. Network with top AI researchers and systems architects.",
      category: EventCategory.TECH,
      city: "Bengaluru",
      venueName: "NIMHANS Convention Centre",
      address: "Hosur Road, Lakkasandra, Bengaluru",
      startsAt: days(12),
      endsAt: days(13),
      status: EventStatus.PUBLISHED,
      coverSeed: "blr-ai-agents-2026",
      tiers: [
        { name: "General Delegate", description: "Keynote, technical track sessions, and lunch", pricePaise: 249900, capacity: 200, sold: 200, maxPerOrder: 4 },
        { name: "All Access VIP", description: "Full conference, speaker dinner, and workshop access", pricePaise: 499900, capacity: 50, sold: 50, maxPerOrder: 2 },
      ],
    },

    // 3. Almost Gone (Exactly 3 tickets left in total)
    {
      slug: "mumbai-sunset-rooftop-standup",
      title: "Mumbai Sunset Standup Showcase",
      description:
        "An exclusive 90-minute comedy set curated by top Mumbai comics. Enjoy breathtaking views of the Arabian Sea paired with non-stop laughter and artisanal beverages.",
      category: EventCategory.COMEDY,
      city: "Mumbai",
      venueName: "Bandra Rooftop Amphitheatre",
      address: "Carter Road, Bandra West, Mumbai",
      startsAt: days(5),
      endsAt: days(5, 3),
      status: EventStatus.PUBLISHED,
      coverSeed: "mumbai-sunset-comedy",
      tiers: [
        { name: "Front Row", description: "Premium front row sofa seating", pricePaise: 79900, capacity: 30, sold: 28, maxPerOrder: 2 },
        { name: "General Seating", description: "Standard amphitheatre seating", pricePaise: 49900, capacity: 50, sold: 49, maxPerOrder: 4 },
      ],
    },

    // 4. One Tier Sold Out (One tier full, others open)
    {
      slug: "hyderabad-culinary-craft-beer-expo",
      title: "Hyderabad Craft Beer & Gourmet Street Food Festival",
      description:
        "Explore over 30 microbreweries and 50 artisan culinary popups celebrating Deccan flavours, smoked meats, and international desserts with live DJ sets throughout the weekend.",
      category: EventCategory.FOOD,
      city: "Hyderabad",
      venueName: "Hitex Exhibition Centre",
      address: "Trade Fair Office Building, IZZAT Nagar, Hyderabad",
      startsAt: days(18),
      endsAt: days(19),
      status: EventStatus.PUBLISHED,
      coverSeed: "hyd-craft-beer-expo",
      tiers: [
        { name: "Tasting Pass", description: "5 craft beer tasters and souvenir glass", pricePaise: 99900, capacity: 50, sold: 50, maxPerOrder: 4 },
        { name: "General Entry", description: "Festival grounds access and live music", pricePaise: 49900, capacity: 250, sold: 60, maxPerOrder: 6 },
      ],
    },

    // 5. Free Event (Price 0 paise)
    {
      slug: "gurugram-open-source-developers-meetup",
      title: "Gurugram Open-Source Community Day",
      description:
        "A community-driven day of tech lightning talks, hands-on workshops, and networking for open-source contributors and maintainers. Refreshments and community stickers provided.",
      category: EventCategory.TECH,
      city: "Gurugram",
      venueName: "CyberHub Social Amphitheatre",
      address: "DLF Cyber City, Sector 24, Gurugram",
      startsAt: days(8),
      endsAt: days(8, 4),
      status: EventStatus.PUBLISHED,
      coverSeed: "gurugram-oss-meetup",
      tiers: [
        { name: "Community RSVP", description: "Free admission to all sessions and workshops", pricePaise: 0, capacity: 150, sold: 85, maxPerOrder: 2 },
        { name: "Supporter RSVP", description: "Free admission plus community contributor badge", pricePaise: 0, capacity: 50, sold: 10, maxPerOrder: 2 },
      ],
    },

    // 6. Cancelled Event (Status CANCELLED)
    {
      slug: "pune-monsoon-trail-running-marathon",
      title: "Pune Western Ghats Monsoon 25K Trail Marathon",
      description:
        "A competitive 25K trail run through Sinhagad ridge with 1,200m elevation gain. Cancelled due to severe weather safety advisories in the Western Ghats region.",
      category: EventCategory.SPORTS,
      city: "Pune",
      venueName: "Sinhagad Forest Base Camp",
      address: "Sinhagad Ghat Road, Thoptewadi, Pune",
      startsAt: days(22),
      endsAt: days(22, 6),
      status: EventStatus.CANCELLED,
      coverSeed: "pune-trail-marathon",
      tiers: [
        { name: "Runner Entry", description: "Race bib, timing chip, and finisher medal", pricePaise: 120000, capacity: 100, sold: 30, maxPerOrder: 2 },
        { name: "Relay Squad", description: "Team of 2 runners for relay leg", pricePaise: 240000, capacity: 25, sold: 5, maxPerOrder: 1 },
      ],
    },

    // 7. Ended Event (Ended yesterday, for 'includePast=true')
    {
      slug: "noida-contemporary-art-dialogue",
      title: "Noida Contemporary Digital Art Exhibition",
      description:
        "Showcasing interactive generative installations, AR sculptures, and digital canvas work from modern Indian visual artists. Completed its showcase run yesterday.",
      category: EventCategory.ART,
      city: "Noida",
      venueName: "Kiran Nadar Museum of Art",
      address: "Plot No. 3 A, Sector 126, Noida",
      startsAt: days(-2),
      endsAt: days(-1),
      status: EventStatus.PUBLISHED,
      coverSeed: "noida-digital-art-expo",
      tiers: [
        { name: "Day Pass", description: "Access to all exhibition galleries", pricePaise: 35000, capacity: 100, sold: 75, maxPerOrder: 6 },
        { name: "Catalogue Bundle", description: "Exhibition entry plus printed commemorative catalogue", pricePaise: 65000, capacity: 30, sold: 20, maxPerOrder: 4 },
      ],
    },

    // 8. Layout Stress Test (Exceptionally long title)
    {
      slug: "delhi-international-experimental-ambient-electronic-sound-arts-festival",
      title: "The 14th Annual All-India International Experimental Ambient Electronic & Modular Synthesizer Sound Arts Festival",
      description:
        "An expansive 12-hour continuous sonic journey featuring quadraphonic soundscapes, live patching on modular synthesizer systems, and hypnotic generative visuals from domestic and international sound designers.",
      category: EventCategory.MUSIC,
      city: "Delhi",
      venueName: "Siri Fort Auditorium Complex",
      address: "August Kranti Marg, Siri Fort Institutional Area, New Delhi",
      startsAt: days(25),
      endsAt: days(26),
      status: EventStatus.PUBLISHED,
      coverSeed: "delhi-long-title-stress-08",
      tiers: [
        { name: "Student Pass", description: "Valid student ID required at entry", pricePaise: 49900, capacity: 50, sold: 12, maxPerOrder: 2 },
        { name: "General Admission", description: "Full 12-hour auditorium access", pricePaise: 99900, capacity: 120, sold: 40, maxPerOrder: 6 },
        { name: "Full Immersion VIP", description: "Front stage acoustic recliner and soundboard tour", pricePaise: 249900, capacity: 30, sold: 15, maxPerOrder: 2 },
      ],
    },

    // 9. Sports - Mumbai Night Cricket
    {
      slug: "mumbai-under-lights-box-cricket-championship",
      title: "Mumbai Corporate Box Cricket League Finals",
      description:
        "Fast-paced 8-over floodlit box cricket tournament featuring 16 invited tech and finance corporate squads battling for the trophy. High energy, boundary nets, and lively commentary.",
      category: EventCategory.SPORTS,
      city: "Mumbai",
      venueName: "Kamala Mills Turf Ground",
      address: "Lower Parel, Mumbai",
      startsAt: days(14),
      endsAt: days(14, 5),
      status: EventStatus.PUBLISHED,
      coverSeed: "mumbai-box-cricket-09",
      tiers: [
        { name: "Spectator Pass", description: "Bleacher seating and tournament snack pack", pricePaise: 25000, capacity: 150, sold: 40, maxPerOrder: 6 },
        { name: "Dugout Pass", description: "Pitchside covered sofa seating", pricePaise: 60000, capacity: 40, sold: 15, maxPerOrder: 4 },
      ],
    },

    // 10. Comedy - Bengaluru Open Mic
    {
      slug: "bengaluru-indiranagar-improv-theatre",
      title: "Indiranagar Improv Comedy & Crowd Work Night",
      description:
        "Unscripted, high-energy improvisational theatre where the audience provides the premises, the characters, and the punchlines. No two shows are ever alike.",
      category: EventCategory.COMEDY,
      city: "Bengaluru",
      venueName: "The Humming Tree Community Stage",
      address: "12th Main Rd, Indiranagar, Bengaluru",
      startsAt: days(9),
      endsAt: days(9, 3),
      status: EventStatus.PUBLISHED,
      coverSeed: "blr-improv-comedy-10",
      tiers: [
        { name: "Single Seat", description: "General café style table seating", pricePaise: 45000, capacity: 60, sold: 25, maxPerOrder: 4 },
        { name: "Couples Sofa", description: "Reserved premium sofa for two", pricePaise: 110000, capacity: 20, sold: 10, maxPerOrder: 2 },
      ],
    },

    // 11. Food - Delhi Street Food
    {
      slug: "purani-dilli-heritage-kebab-walk",
      title: "Old Delhi Midnight Culinary & Kebab Heritage Walk",
      description:
        "A curated walking tour through historic Matia Mahal and Jama Masjid lanes, tasting slow-cooked nihari, seekh kebabs, and shahi tukda led by a local food historian.",
      category: EventCategory.FOOD,
      city: "Delhi",
      venueName: "Jama Masjid Gate No. 1",
      address: "Chandni Chowk, Old Delhi",
      startsAt: days(16),
      endsAt: days(16, 4),
      status: EventStatus.PUBLISHED,
      coverSeed: "delhi-heritage-food-11",
      tiers: [
        { name: "Walk & Food Pass", description: "Guided tour and 6 signature food tastings", pricePaise: 149900, capacity: 25, sold: 18, maxPerOrder: 4 },
        { name: "Gourmet Feast Pass", description: "Full tastings plus take-home spice pack and sweet box", pricePaise: 249900, capacity: 15, sold: 8, maxPerOrder: 2 },
      ],
    },

    // 12. Art - Hyderabad Ceramics
    {
      slug: "hyderabad-pottery-wheel-masterclass",
      title: "Jubilee Hills Hand-Built Ceramics & Pottery Masterclass",
      description:
        "Spend your weekend getting your hands clay-covered. Learn centering on the pottery wheel, trimming techniques, and underglaze decorating under expert ceramicists.",
      category: EventCategory.ART,
      city: "Hyderabad",
      venueName: "Claypotter Studio",
      address: "Road No. 36, Jubilee Hills, Hyderabad",
      startsAt: days(21),
      endsAt: days(21, 3),
      status: EventStatus.PUBLISHED,
      coverSeed: "hyd-ceramics-masterclass-12",
      tiers: [
        { name: "Workshop Entry", description: "Includes 2kg clay, wheel time, and kiln firing of 2 pieces", pricePaise: 220000, capacity: 16, sold: 8, maxPerOrder: 2 },
        { name: "Master Edition", description: "Includes full wheel workshop plus glazing and shipping fired pieces home", pricePaise: 380000, capacity: 8, sold: 3, maxPerOrder: 2 },
      ],
    },

    // 13. Tech - Pune Web Architecture
    {
      slug: "pune-nextjs-distributed-web-conf",
      title: "Pune Next.js & Serverless Systems Conference",
      description:
        "Deep dive into edge functions, streaming SSR, IndexedDB synchronization, and zero-cost cloud architecture with veteran engineering leaders from top startups.",
      category: EventCategory.TECH,
      city: "Pune",
      venueName: "Amanora The Fern Hall",
      address: "Magarpatta Road, Hadapsar, Pune",
      startsAt: days(29),
      endsAt: days(29, 7),
      status: EventStatus.PUBLISHED,
      coverSeed: "pune-nextjs-conf-13",
      tiers: [
        { name: "Early Adopter", description: "Early discounted full conference pass", pricePaise: 79900, capacity: 100, sold: 95, maxPerOrder: 4 },
        { name: "Regular Entry", description: "Full day conference, tech showcase, and buffet lunch", pricePaise: 119900, capacity: 180, sold: 55, maxPerOrder: 6 },
        { name: "Architect Roundtable", description: "Conference pass plus closed-door systems architecture session", pricePaise: 349900, capacity: 20, sold: 12, maxPerOrder: 2 },
      ],
    },

    // 14. Music - Gurugram Classical Fusion
    {
      slug: "gurugram-sitar-synth-fusion-sundowner",
      title: "Sitar & Synthesizer Sunset Fusion Concert",
      description:
        "Classical Indian ragas reimagined with analog bass synthesizers and cinematic percussion, performing live on an open-air terrace overlooking the Aravalli hills.",
      category: EventCategory.MUSIC,
      city: "Gurugram",
      venueName: "One Horizon Center Terrace",
      address: "Golf Course Road, DLF Phase 5, Gurugram",
      startsAt: days(35),
      endsAt: days(35, 4),
      status: EventStatus.PUBLISHED,
      coverSeed: "gurugram-sitar-fusion-14",
      tiers: [
        { name: "General Admission", description: "Terrace entry and unreserved seating", pricePaise: 75000, capacity: 120, sold: 30, maxPerOrder: 6 },
        { name: "Front Row Lounge", description: "Front stage reserved lounge table", pricePaise: 180000, capacity: 30, sold: 12, maxPerOrder: 4 },
        { name: "VIP Experience", description: "Lounge table plus wine tasting and artist vinyl record", pricePaise: 320000, capacity: 15, sold: 5, maxPerOrder: 2 },
      ],
    },
  ];

  for (const ev of events) {
    const { tiers, ...eventData } = ev;
    await prisma.event.create({
      data: {
        ...eventData,
        tiers: {
          create: tiers,
        },
      },
    });
  }

  // Also seed demo order and tickets so offline gate scanner and wallet demo work out of the box
  const firstEvent = await prisma.event.findFirst({
    where: { slug: "delhi-live-indie-music-nights" },
    include: { tiers: true },
  });

  if (firstEvent && firstEvent.tiers.length > 0) {
    const guest = await prisma.guest.create({
      data: { id: "demo_guest_1", displayName: "Alex Rivera" },
    });
    const order = await prisma.order.create({
      data: {
        id: "ord_indie_01",
        guestId: guest.id,
        eventId: firstEvent.id,
        attendeeName: "Alex Rivera",
        totalPaise: 139800,
        status: "CONFIRMED",
        paymentRef: "FAKE-SEED-01",
      },
    });
    // Create valid ticket
    await prisma.ticket.create({
      data: {
        id: "tkt_indie_01",
        orderId: order.id,
        eventId: firstEvent.id,
        tierId: firstEvent.tiers[0].id,
        guestId: guest.id,
        attendeeName: "Alex Rivera",
        code: generateTicketCode("tkt_indie_01", firstEvent.id),
        status: "VALID",
      },
    });
    // Create used ticket
    const ticket2Code = generateTicketCode("tkt_indie_02", firstEvent.id);
    const ticket2 = await prisma.ticket.create({
      data: {
        id: "tkt_indie_02",
        orderId: order.id,
        eventId: firstEvent.id,
        tierId: firstEvent.tiers[0].id,
        guestId: guest.id,
        attendeeName: "Sam Rivera",
        code: ticket2Code,
        status: "USED",
        usedAt: new Date(now.getTime() - 3600 * 1000),
        usedByDeviceId: "device_gate_scanner_primary",
      },
    });
    await prisma.scanLog.create({
      data: {
        id: "log_01",
        eventId: firstEvent.id,
        ticketId: ticket2.id,
        code: ticket2Code,
        deviceId: "device_gate_scanner_primary",
        result: "ADMITTED",
        source: "ONLINE",
        scannedAt: new Date(now.getTime() - 3600 * 1000),
      },
    });
  }

  return {
    success: true,
    mode: "neon",
    message: "Database successfully reset and seeded with 14 representative events.",
  };
}
