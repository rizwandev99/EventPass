import { generateTicketCode } from "@/lib/domain/ticket-sig";

export function isPlaceholderOrUnreachable(url?: string): boolean {
  if (!url) return true;
  return (
    url.includes("user:password") ||
    url.includes("ep-sample") ||
    url.includes("ep-test.us-east-2.aws.neon.tech")
  );
}

export interface MockTier {
  id: string;
  eventId: string;
  name: string;
  description: string;
  pricePaise: number;
  capacity: number;
  sold: number;
  maxPerOrder: number;
}

export interface MockEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "MUSIC" | "TECH" | "SPORTS" | "COMEDY" | "FOOD" | "ART";
  city: string;
  venueName: string;
  address: string;
  startsAt: Date;
  endsAt: Date;
  status: "PUBLISHED" | "CANCELLED";
  coverSeed: string;
  tiers?: MockTier[];
}

export interface MockTicket {
  id: string;
  orderId: string;
  eventId: string;
  tierId: string;
  guestId: string;
  attendeeName: string;
  code: string;
  status: "VALID" | "USED" | "CANCELLED";
  usedAt: Date | null;
  usedByDeviceId: string | null;
  createdAt: Date;
  event?: MockEvent;
  order?: MockOrder;
}

export interface MockOrder {
  id: string;
  guestId: string;
  eventId: string;
  attendeeName: string;
  totalPaise: number;
  status: "CONFIRMED" | "CANCELLED";
  paymentRef: string;
  createdAt: Date;
  tickets?: MockTicket[];
}

export interface MockScanLog {
  id: string;
  eventId: string;
  ticketId?: string | null;
  code: string;
  deviceId: string;
  result: "ADMITTED" | "ALREADY_USED" | "INVALID" | "WRONG_EVENT" | "TICKET_CANCELLED";
  source: "ONLINE" | "OFFLINE_SYNC";
  scannedAt: Date;
}

export interface MockGuest {
  id: string;
  displayName: string | null;
  createdAt: Date;
}

export interface MockRateLimit {
  id: string;
  key: string;
  windowStart: Date;
  count: number;
}

export function createInitialData() {
  const now = new Date();
  const hours = (h: number) => new Date(now.getTime() + h * 3600 * 1000);
  const days = (d: number, h = 0) => new Date(now.getTime() + (d * 24 + h) * 3600 * 1000);

  const events: MockEvent[] = [
    {
      id: "evt_tech_conf",
      slug: "tech-future-conf",
      title: "Tech Future Summit & AI Expo",
      description: "Annual conference exploring modern tech stacks and AI workflows.",
      category: "TECH",
      city: "Bengaluru",
      venueName: "Bengaluru International Exhibition Centre",
      address: "10th Mile, Tumkur Road, Bengaluru",
      startsAt: days(7),
      endsAt: days(8),
      status: "PUBLISHED",
      coverSeed: "tech-future-conf-seed",
    },
    {
      id: "evt_indie_rock",
      slug: "indie-rock-night",
      title: "Delhi Live: Indie Music & Acoustic Nights",
      description: "An intimate evening featuring five breakthrough independent indie artists from across the country.",
      category: "MUSIC",
      city: "Delhi",
      venueName: "The Piano Man Jazz Club",
      address: "Commercial Complex B 6/7-22, Safdarjung Enclave, New Delhi",
      startsAt: hours(4),
      endsAt: hours(8),
      status: "PUBLISHED",
      coverSeed: "delhi-indie-acoustic-01",
    },
    {
      id: "evt_monsoon_fest",
      slug: "monsoon-music-fest",
      title: "Pune Western Ghats Monsoon Music Fest",
      description: "This event has been cancelled due to heavy monsoon weather forecasts.",
      category: "MUSIC",
      city: "Pune",
      venueName: "Western Ghats Arena",
      address: "Lonavala Road, Pune",
      startsAt: days(2),
      endsAt: days(2, 6),
      status: "CANCELLED",
      coverSeed: "pune-monsoon-trail",
    },
    {
      id: "evt_open_mic",
      slug: "community-open-mic",
      title: "Free Community Open Mic Night",
      description: "Open mic evening for standup comedy and acoustic indie music. Free entry.",
      category: "COMEDY",
      city: "Bengaluru",
      venueName: "Koramangala Community Hall",
      address: "80 Feet Road, Koramangala, Bengaluru",
      startsAt: days(3),
      endsAt: days(3, 3),
      status: "PUBLISHED",
      coverSeed: "blr-open-mic",
    },
    {
      id: "evt_ai_summit",
      slug: "bengaluru-ai-systems-summit-2026",
      title: "Bengaluru AI Systems & Autonomous Agents Summit",
      description: "India's premier technical conference focused on production LLM infrastructure and multi-agent frameworks.",
      category: "TECH",
      city: "Bengaluru",
      venueName: "NIMHANS Convention Centre",
      address: "Hosur Road, Lakkasandra, Bengaluru",
      startsAt: days(12),
      endsAt: days(13),
      status: "PUBLISHED",
      coverSeed: "blr-ai-agents-2026",
    },
    {
      id: "evt_mumbai_comedy",
      slug: "mumbai-sunset-rooftop-standup",
      title: "Mumbai Sunset Standup Showcase",
      description: "An exclusive 90-minute comedy set curated by top Mumbai comics.",
      category: "COMEDY",
      city: "Mumbai",
      venueName: "Bandra Rooftop Amphitheatre",
      address: "Carter Road, Bandra West, Mumbai",
      startsAt: days(5),
      endsAt: days(5, 3),
      status: "PUBLISHED",
      coverSeed: "mumbai-sunset-comedy",
    },
    {
      id: "evt_hyd_beer",
      slug: "hyderabad-culinary-craft-beer-expo",
      title: "Hyderabad Craft Beer & Gourmet Street Food Festival",
      description: "Explore over 30 microbreweries and 50 artisan culinary popups.",
      category: "FOOD",
      city: "Hyderabad",
      venueName: "Hitex Exhibition Centre",
      address: "Trade Fair Office Building, IZZAT Nagar, Hyderabad",
      startsAt: days(18),
      endsAt: days(19),
      status: "PUBLISHED",
      coverSeed: "hyd-craft-beer-expo",
    },
    {
      id: "evt_gurugram_rust",
      slug: "gurugram-open-source-developers-meetup",
      title: "Gurugram Open Source & Rust Developers Meetup",
      description: "Deep dive into systems programming with Rust, WebAssembly, and local LLM runtime optimization.",
      category: "TECH",
      city: "Gurugram",
      venueName: "Cyber City Co-Working Space",
      address: "DLF Cyber City, Phase 2, Gurugram",
      startsAt: days(7),
      endsAt: days(7, 4),
      status: "PUBLISHED",
      coverSeed: "ggn-rust-oss",
    },
    {
      id: "evt_noida_art",
      slug: "noida-contemporary-art-dialogue",
      title: "Noida Contemporary Indian Art Dialogue & Exhibition",
      description: "Curated showcase of over 80 modern sculptures, generative installations, and mixed-media paintings.",
      category: "ART",
      city: "Noida",
      venueName: "Kiran Nadar Museum of Art Satellite",
      address: "Sector 126, Noida",
      startsAt: days(9),
      endsAt: days(10),
      status: "PUBLISHED",
      coverSeed: "noida-art-dialogue",
    },
  ];

  const tiers: MockTier[] = [
    // Tech conf tier
    { id: "tier_general", eventId: "evt_tech_conf", name: "General Pass", description: "Full summit pass", pricePaise: 49900, capacity: 100, sold: 10, maxPerOrder: 10 },
    // Indie rock tiers
    { id: "tier_indie_1", eventId: "evt_indie_rock", name: "Early Bird", description: "Standard entry with complimentary drink", pricePaise: 49900, capacity: 50, sold: 10, maxPerOrder: 4 },
    { id: "tier_indie_2", eventId: "evt_indie_rock", name: "General Admission", description: "Access to main hall and standing pit", pricePaise: 89900, capacity: 100, sold: 20, maxPerOrder: 6 },
    { id: "tier_indie_3", eventId: "evt_indie_rock", name: "VIP Pass", description: "Mezzanine lounge seating and artist meet & greet", pricePaise: 199900, capacity: 20, sold: 5, maxPerOrder: 2 },
    // Monsoon fest tiers
    { id: "tier_monsoon_1", eventId: "evt_monsoon_fest", name: "Standard Entry", description: "Festival access", pricePaise: 99900, capacity: 100, sold: 0, maxPerOrder: 4 },
    // Open mic tiers (Free)
    { id: "tier_openmic_1", eventId: "evt_open_mic", name: "Free Entry", description: "General admission seating", pricePaise: 0, capacity: 100, sold: 10, maxPerOrder: 2 },
    // AI Summit tiers (Sold out)
    { id: "tier_ai_1", eventId: "evt_ai_summit", name: "General Delegate", description: "Keynote and track access", pricePaise: 249900, capacity: 200, sold: 200, maxPerOrder: 4 },
    { id: "tier_ai_2", eventId: "evt_ai_summit", name: "All Access VIP", description: "Full conference and dinner", pricePaise: 499900, capacity: 50, sold: 50, maxPerOrder: 2 },
    // Mumbai comedy tiers
    { id: "tier_mumbai_1", eventId: "evt_mumbai_comedy", name: "Front Row", description: "Premium front row sofa seating", pricePaise: 79900, capacity: 30, sold: 28, maxPerOrder: 2 },
    { id: "tier_mumbai_2", eventId: "evt_mumbai_comedy", name: "General Seating", description: "Standard amphitheatre seating", pricePaise: 49900, capacity: 50, sold: 49, maxPerOrder: 4 },
    // Hyderabad beer tiers
    { id: "tier_hyd_1", eventId: "evt_hyd_beer", name: "Tasting Pass", description: "5 craft beer tasters", pricePaise: 99900, capacity: 50, sold: 50, maxPerOrder: 4 },
    { id: "tier_hyd_2", eventId: "evt_hyd_beer", name: "General Entry", description: "Festival grounds access", pricePaise: 49900, capacity: 250, sold: 60, maxPerOrder: 6 },
    // Gurugram rust tiers (Free)
    { id: "tier_rust_1", eventId: "evt_gurugram_rust", name: "Community RSVD", description: "Access to talks and refreshments", pricePaise: 0, capacity: 80, sold: 70, maxPerOrder: 2 },
    // Noida art tiers
    { id: "tier_noida_1", eventId: "evt_noida_art", name: "Gallery Pass", description: "Day entry to gallery", pricePaise: 29900, capacity: 150, sold: 40, maxPerOrder: 4 },
  ];

  // Seed tickets for offline scanner and wallet demo
  const ticket1Code = generateTicketCode("tkt_indie_01", "evt_indie_rock");
  const ticket2Code = generateTicketCode("tkt_indie_02", "evt_indie_rock");

  const orders: MockOrder[] = [
    {
      id: "ord_indie_01",
      guestId: "demo_guest_1",
      eventId: "evt_indie_rock",
      attendeeName: "Alex Rivera",
      totalPaise: 139800,
      status: "CONFIRMED",
      paymentRef: "FAKE-SEED-01",
      createdAt: hours(-2),
    },
  ];

  const tickets: MockTicket[] = [
    {
      id: "tkt_indie_01",
      orderId: "ord_indie_01",
      eventId: "evt_indie_rock",
      tierId: "tier_indie_1",
      guestId: "demo_guest_1",
      attendeeName: "Alex Rivera",
      code: ticket1Code,
      status: "VALID",
      usedAt: null,
      usedByDeviceId: null,
      createdAt: hours(-2),
    },
    {
      id: "tkt_indie_02",
      orderId: "ord_indie_01",
      eventId: "evt_indie_rock",
      tierId: "tier_indie_2",
      guestId: "demo_guest_1",
      attendeeName: "Sam Rivera",
      code: ticket2Code,
      status: "USED",
      usedAt: hours(-1),
      usedByDeviceId: "device_gate_scanner_primary",
      createdAt: hours(-2),
    },
  ];

  const scanLogs: MockScanLog[] = [
    {
      id: "log_01",
      eventId: "evt_indie_rock",
      ticketId: "tkt_indie_02",
      code: ticket2Code,
      deviceId: "device_gate_scanner_primary",
      result: "ADMITTED",
      source: "ONLINE",
      scannedAt: hours(-1),
    },
  ];

  const guests: MockGuest[] = [
    { id: "demo_guest_1", displayName: "Alex Rivera", createdAt: hours(-2) },
  ];

  const rateLimits: MockRateLimit[] = [];

  return { events, tiers, orders, tickets, scanLogs, guests, rateLimits };
}

export class InMemoryDatabase {
  events: MockEvent[] = [];
  tiers: MockTier[] = [];
  orders: MockOrder[] = [];
  tickets: MockTicket[] = [];
  scanLogs: MockScanLog[] = [];
  guests: MockGuest[] = [];
  rateLimits: MockRateLimit[] = [];

  $connect = async () => {};
  $disconnect = async () => {};
  $queryRaw = async () => [];
  $executeRawUnsafe = async () => 0;
  $executeRaw = async () => 0;
  $transaction = async (cb: any) => {
    if (typeof cb === "function") return cb(this);
    if (Array.isArray(cb)) return Promise.all(cb);
    return cb;
  };

  constructor() {
    this.reset();
  }

  reset() {
    const data = createInitialData();
    this.events = data.events;
    this.tiers = data.tiers;
    this.orders = data.orders;
    this.tickets = data.tickets;
    this.scanLogs = data.scanLogs;
    this.guests = data.guests;
    this.rateLimits = data.rateLimits;
  }

  get event() {
    return {
      findMany: async (args: any = {}) => {
        let results = [...this.events];
        const where = args.where || {};

        if (where.status) {
          results = results.filter((e) => e.status === where.status);
        }
        if (where.endsAt?.gte) {
          const gte = new Date(where.endsAt.gte).getTime();
          results = results.filter((e) => new Date(e.endsAt).getTime() >= gte);
        }
        if (where.category) {
          results = results.filter((e) => e.category === where.category);
        }
        if (where.city) {
          const cityVal = typeof where.city === "object" ? where.city.equals : where.city;
          if (cityVal) {
            results = results.filter((e) => e.city.toLowerCase() === cityVal.toLowerCase());
          }
        }
        if (where.OR && Array.isArray(where.OR)) {
          results = results.filter((e) => {
            return where.OR.some((clause: any) => {
              if (clause.title?.contains) {
                return e.title.toLowerCase().includes(clause.title.contains.toLowerCase());
              }
              if (clause.description?.contains) {
                return e.description.toLowerCase().includes(clause.description.contains.toLowerCase());
              }
              if (clause.venueName?.contains) {
                return e.venueName.toLowerCase().includes(clause.venueName.contains.toLowerCase());
              }
              if (clause.city?.contains) {
                return e.city.toLowerCase().includes(clause.city.contains.toLowerCase());
              }
              if (clause.category?.equals) {
                return e.category === clause.category.equals;
              }
              return false;
            });
          });
        }

        // Sorting
        if (args.orderBy?.startsAt) {
          const asc = args.orderBy.startsAt === "asc";
          results.sort((a, b) => (asc ? a.startsAt.getTime() - b.startsAt.getTime() : b.startsAt.getTime() - a.startsAt.getTime()));
        }

        // Cursor & paging
        if (args.cursor?.id) {
          const idx = results.findIndex((e) => e.id === args.cursor.id);
          if (idx !== -1) results = results.slice(idx + 1);
        }
        if (args.take) {
          results = results.slice(0, args.take);
        }

        // Include tiers
        if (args.include?.tiers) {
          return results.map((e) => ({
            ...e,
            tiers: this.tiers.filter((t) => t.eventId === e.id),
          }));
        }

        return results;
      },

      findUnique: async (args: any) => {
        const where = args.where || {};
        const found = this.events.find((e) => (where.slug && e.slug === where.slug) || (where.id && e.id === where.id));
        if (!found) return null;

        if (args.include?.tiers) {
          const eventTiers = this.tiers.filter((t) => t.eventId === found.id);
          if (args.include.tiers.orderBy?.pricePaise) {
            const asc = args.include.tiers.orderBy.pricePaise === "asc";
            eventTiers.sort((a, b) => (asc ? a.pricePaise - b.pricePaise : b.pricePaise - a.pricePaise));
          }
          return { ...found, tiers: eventTiers };
        }
        return found;
      },

      count: async (args: any = {}) => {
        const list = await this.event.findMany(args);
        return list.length;
      },

      deleteMany: async () => {
        this.events = [];
        return { count: 0 };
      },
    };
  }

  get ticketTier() {
    return {
      findUnique: async (args: any) => {
        const where = args.where || {};
        return this.tiers.find((t) => t.id === where.id) || null;
      },

      update: async (args: any) => {
        const where = args.where || {};
        const tier = this.tiers.find((t) => t.id === where.id);
        if (!tier) throw new Error("Tier not found");
        if (args.data?.sold?.increment !== undefined) {
          tier.sold += args.data.sold.increment;
        } else if (typeof args.data?.sold === "number") {
          tier.sold = args.data.sold;
        }
        return tier;
      },

      deleteMany: async () => {
        this.tiers = [];
        return { count: 0 };
      },
    };
  }

  get order() {
    return {
      create: async (args: any) => {
        const data = args.data;
        const newOrder: MockOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          guestId: data.guestId,
          eventId: data.eventId,
          attendeeName: data.attendeeName,
          totalPaise: data.totalPaise,
          status: data.status || "CONFIRMED",
          paymentRef: data.paymentRef,
          createdAt: new Date(),
        };
        this.orders.push(newOrder);

        // Handle nested tickets.create
        if (data.tickets?.create && Array.isArray(data.tickets.create)) {
          for (const item of data.tickets.create) {
            const newTicket: MockTicket = {
              id: item.id || `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              orderId: newOrder.id,
              eventId: data.eventId,
              tierId: item.tierId,
              guestId: data.guestId,
              attendeeName: item.attendeeName,
              code: item.code,
              status: item.status || "VALID",
              usedAt: null,
              usedByDeviceId: null,
              createdAt: new Date(),
            };
            this.tickets.push(newTicket);
          }
        }

        return newOrder;
      },

      findMany: async (args: any = {}) => {
        let results = [...this.orders];
        if (args.where?.guestId) {
          results = results.filter((o) => o.guestId === args.where.guestId);
        }
        return results;
      },

      deleteMany: async () => {
        this.orders = [];
        return { count: 0 };
      },
    };
  }

  get ticket() {
    return {
      create: async (args: any) => {
        const data = args.data;
        const newTicket: MockTicket = {
          id: data.id || `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: data.orderId,
          eventId: data.eventId,
          tierId: data.tierId,
          guestId: data.guestId,
          attendeeName: data.attendeeName,
          code: data.code,
          status: data.status || "VALID",
          usedAt: data.usedAt || null,
          usedByDeviceId: data.usedByDeviceId || null,
          createdAt: new Date(),
        };
        this.tickets.push(newTicket);
        return newTicket;
      },

      findUnique: async (args: any) => {
        const where = args.where || {};
        const t = this.tickets.find((item) => (where.id && item.id === where.id) || (where.code && item.code === where.code));
        if (!t) return null;

        const res: any = { ...t };
        if (args.include?.event) {
          res.event = this.events.find((e) => e.id === t.eventId);
        }
        if (args.include?.order) {
          res.order = this.orders.find((o) => o.id === t.orderId);
        }
        return res;
      },

      findMany: async (args: any = {}) => {
        let results = [...this.tickets];
        const where = args.where || {};

        if (where.guestId) {
          results = results.filter((t) => t.guestId === where.guestId);
        }
        if (where.eventId) {
          results = results.filter((t) => t.eventId === where.eventId);
        }

        if (args.include?.event || args.include?.order) {
          results = results.map((t) => {
            const copy: any = { ...t };
            if (args.include?.event) {
              copy.event = this.events.find((e) => e.id === t.eventId);
            }
            if (args.include?.order) {
              copy.order = this.orders.find((o) => o.id === t.orderId);
            }
            return copy;
          });
        }

        return results;
      },

      updateMany: async (args: any) => {
        const where = args.where || {};
        const data = args.data || {};
        let count = 0;

        for (const t of this.tickets) {
          const matchId = !where.id || t.id === where.id;
          const matchStatus = !where.status || t.status === where.status;
          if (matchId && matchStatus) {
            if (data.status) t.status = data.status;
            if (data.usedAt) t.usedAt = data.usedAt;
            if (data.usedByDeviceId) t.usedByDeviceId = data.usedByDeviceId;
            count++;
          }
        }

        return { count };
      },

      count: async (args: any = {}) => {
        let results = [...this.tickets];
        const where = args.where || {};
        if (where.eventId) {
          results = results.filter((t) => t.eventId === where.eventId);
        }
        if (where.guestId) {
          results = results.filter((t) => t.guestId === where.guestId);
        }
        if (where.status) {
          if (typeof where.status === "string") {
            results = results.filter((t) => t.status === where.status);
          } else if (where.status?.in && Array.isArray(where.status.in)) {
            results = results.filter((t) => where.status.in.includes(t.status));
          }
        }
        return results.length;
      },

      deleteMany: async () => {
        this.tickets = [];
        return { count: 0 };
      },
    };
  }

  get scanLog() {
    return {
      create: async (args: any) => {
        const newLog: MockScanLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ...args.data,
          scannedAt: args.data.scannedAt || new Date(),
        };
        this.scanLogs.push(newLog);
        return newLog;
      },

      findMany: async (args: any = {}) => {
        let results = [...this.scanLogs];
        if (args.where?.eventId) {
          results = results.filter((l) => l.eventId === args.where.eventId);
        }
        return results;
      },

      count: async (args: any = {}) => {
        let results = [...this.scanLogs];
        const where = args.where || {};
        if (where.eventId) results = results.filter((l) => l.eventId === where.eventId);
        if (where.result) results = results.filter((l) => l.result === where.result);
        return results.length;
      },

      deleteMany: async () => {
        this.scanLogs = [];
        return { count: 0 };
      },
    };
  }

  get guest() {
    return {
      findUnique: async (args: any) => {
        const where = args.where || {};
        return this.guests.find((g) => g.id === where.id) || null;
      },

      upsert: async (args: any) => {
        const where = args.where || {};
        let g = this.guests.find((item) => item.id === where.id);
        if (!g) {
          g = {
            id: where.id,
            displayName: args.create?.displayName || null,
            createdAt: new Date(),
          };
          this.guests.push(g);
        }
        return g;
      },

      deleteMany: async () => {
        this.guests = [];
        return { count: 0 };
      },
    };
  }

  get rateLimit() {
    return {
      count: async (args: any = {}) => {
        let results = [...this.rateLimits];
        if (args.where?.key) results = results.filter((r) => r.key === args.where.key);
        if (args.where?.windowStart?.gte) {
          const gte = new Date(args.where.windowStart.gte).getTime();
          results = results.filter((r) => r.windowStart.getTime() >= gte);
        }
        return results.length;
      },

      create: async (args: any) => {
        const newRL: MockRateLimit = {
          id: `rl_${Date.now()}`,
          key: args.data.key,
          windowStart: args.data.windowStart || new Date(),
          count: args.data.count || 1,
        };
        this.rateLimits.push(newRL);
        return newRL;
      },

      deleteMany: async () => {
        this.rateLimits = [];
        return { count: 0 };
      },
    };
  }
}

export const mockDb = new InMemoryDatabase();
