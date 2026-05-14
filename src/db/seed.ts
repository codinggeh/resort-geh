import { db } from "./index";
import { v4 as uuid } from "uuid";
import { sql } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

const isPostgres = !!process.env.DATABASE_URL;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const schema = isPostgres ? require("./schema.pg") : require("./schema");
const { accounts, bookings, payments, reviews, users, villas } = schema;

function dateOffset(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function isoDate(days: number) {
  return dateOffset(days).toISOString().slice(0, 10);
}

function isoTimestamp(days: number, hour = 12) {
  const date = dateOffset(days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

function money(value: number) {
  return Number(value.toFixed(2));
}

function transactionId(index: number) {
  return `RG-${String(index + 1).padStart(4, "0")}`;
}

async function seed() {
  const passwordHash = await hashPassword("password123");
  console.log("🌱 Seeding database with realistic demo data...");

  await db.execute(sql`DELETE FROM reviews`);
  await db.execute(sql`DELETE FROM payments`);
  await db.execute(sql`DELETE FROM bookings`);
  await db.execute(sql`DELETE FROM accounts`);
  await db.execute(sql`DELETE FROM sessions`);
  await db.execute(sql`DELETE FROM villas`);
  await db.execute(sql`DELETE FROM users`);

  const userSeeds = [
    {
      key: "superAdmin",
      id: uuid(),
      name: "Maya Santoso",
      email: "superadmin@resortsgeh.test",
      role: "SUPER_ADMIN" as const,
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      createdOffset: -180,
    },
    {
      key: "admin",
      id: uuid(),
      name: "Arif Pradana",
      email: "admin@resortsgeh.test",
      role: "ADMIN" as const,
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      createdOffset: -140,
    },
    {
      key: "guestPrimary",
      id: uuid(),
      name: "Nadia Rahma",
      email: "guest@resortsgeh.test",
      role: "GUEST" as const,
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      createdOffset: -90,
    },
    {
      key: "guestLucas",
      id: uuid(),
      name: "Lucas Bennett",
      email: "lucas@resortsgeh.test",
      role: "GUEST" as const,
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      createdOffset: -82,
    },
    {
      key: "guestAyu",
      id: uuid(),
      name: "Ayu Pramesti",
      email: "ayu@resortsgeh.test",
      role: "GUEST" as const,
      avatarUrl:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop",
      createdOffset: -76,
    },
    {
      key: "guestOwen",
      id: uuid(),
      name: "Owen Hart",
      email: "owen@resortsgeh.test",
      role: "GUEST" as const,
      avatarUrl:
        "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&h=200&fit=crop",
      createdOffset: -64,
    },
    {
      key: "guestMika",
      id: uuid(),
      name: "Mika Tan",
      email: "mika@resortsgeh.test",
      role: "GUEST" as const,
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      createdOffset: -52,
    },
  ];

  await db.insert(users).values(
    userSeeds.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: dateOffset(user.createdOffset),
      emailVerified: true,
      updatedAt: dateOffset(user.createdOffset),
    }))
  );

  await db.insert(accounts).values(
    userSeeds.map((user) => ({
      id: uuid(),
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: passwordHash,
      createdAt: dateOffset(user.createdOffset),
      updatedAt: dateOffset(user.createdOffset),
    }))
  );

  console.log(`  ✅ Users & accounts seeded (${userSeeds.length} users)`);

  const villaSeeds = [
    {
      key: "sesehTide",
      id: uuid(),
      name: "Seseh Tide Villa",
      slug: "seseh-tide-villa",
      description:
        "A calm beachfront stay with a long pool, direct sand access, and sunset dinners set against the west coast breeze.",
      pricePerNight: 465,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ["wifi", "pool", "kitchen", "beach_access", "air_conditioning", "parking", "bbq_grill"],
      imageUrls: [
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1400",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400",
      ],
      status: "AVAILABLE" as const,
      createdOffset: -140,
    },
    {
      key: "ubudCanopy",
      id: uuid(),
      name: "Ubud Canopy Residence",
      slug: "ubud-canopy-residence",
      description:
        "A quieter jungle address with layered terraces, a small plunge pool, and soft interiors designed for longer restorative stays.",
      pricePerNight: 335,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["wifi", "kitchen", "garden", "air_conditioning", "parking", "fireplace"],
      imageUrls: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1400",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1400",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400",
      ],
      status: "AVAILABLE" as const,
      createdOffset: -132,
    },
    {
      key: "batuKarang",
      id: uuid(),
      name: "Batu Karang Estate",
      slug: "batu-karang-estate",
      description:
        "A large cliff-edge estate with an infinity pool, gym pavilion, and wide entertaining spaces for multi-family trips.",
      pricePerNight: 910,
      maxGuests: 10,
      bedrooms: 5,
      bathrooms: 5,
      amenities: ["wifi", "infinity_pool", "kitchen", "gym", "air_conditioning", "parking"],
      imageUrls: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400",
      ],
      status: "AVAILABLE" as const,
      createdOffset: -128,
    },
    {
      key: "cangguCourtyard",
      id: uuid(),
      name: "Canggu Courtyard House",
      slug: "canggu-courtyard-house",
      description:
        "A modern courtyard villa with stronger indoor-outdoor flow, close to cafés and beach clubs without feeling noisy.",
      pricePerNight: 415,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ["wifi", "pool", "kitchen", "garden", "air_conditioning", "parking"],
      imageUrls: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1400",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1400",
      ],
      status: "AVAILABLE" as const,
      createdOffset: -121,
    },
    {
      key: "sidemenRidge",
      id: uuid(),
      name: "Sidemen Ridge Villa",
      slug: "sidemen-ridge-villa",
      description:
        "A slower hillside retreat overlooking the valley, with cooler evenings, a fireplace nook, and generous garden decks.",
      pricePerNight: 290,
      maxGuests: 5,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["wifi", "fireplace", "kitchen", "garden", "parking"],
      imageUrls: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&sat=-30",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&bri=-10",
      ],
      status: "AVAILABLE" as const,
      createdOffset: -116,
    },
    {
      key: "lembonganHorizon",
      id: uuid(),
      name: "Lembongan Horizon Villa",
      slug: "lembongan-horizon-villa",
      description:
        "A high-season favorite currently under refresh, known for its roof deck and broad sea horizon across the island edge.",
      pricePerNight: 560,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 4,
      amenities: ["wifi", "infinity_pool", "kitchen", "air_conditioning", "parking"],
      imageUrls: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1400",
        "https://images.unsplash.com/photo-1602343168117-bb8bbe693f30?w=1400",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400",
      ],
      status: "MAINTENANCE" as const,
      createdOffset: -110,
    },
    {
      key: "seminyakLoft",
      id: uuid(),
      name: "Seminyak Loft Residence",
      slug: "seminyak-loft-residence",
      description:
        "An urban two-bedroom loft used for internal testing and hidden from the public collection while content is being revised.",
      pricePerNight: 245,
      maxGuests: 3,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["wifi", "kitchen", "air_conditioning", "parking", "gym"],
      imageUrls: [
        "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1400",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&con=-10",
      ],
      status: "HIDDEN" as const,
      createdOffset: -102,
    },
  ];

  await db.insert(villas).values(
    villaSeeds.map((villa) => ({
      id: villa.id,
      name: villa.name,
      slug: villa.slug,
      description: villa.description,
      pricePerNight: villa.pricePerNight,
      maxGuests: villa.maxGuests,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
      amenities: villa.amenities,
      imageUrls: villa.imageUrls,
      status: villa.status,
      createdAt: isoTimestamp(villa.createdOffset),
    }))
  );

  console.log(`  ✅ Villas seeded (${villaSeeds.length} villas)`);

  const usersByKey = Object.fromEntries(userSeeds.map((user) => [user.key, user]));
  const villasByKey = Object.fromEntries(villaSeeds.map((villa) => [villa.key, villa]));

  const bookingSeeds = [
    {
      villaKey: "sesehTide",
      guestKey: "guestPrimary",
      checkInOffset: -96,
      checkOutOffset: -91,
      guestCount: 4,
      status: "COMPLETED" as const,
      createdOffset: -122,
      paymentMethod: "CREDIT_CARD" as const,
      processedOffset: -121,
    },
    {
      villaKey: "ubudCanopy",
      guestKey: "guestAyu",
      checkInOffset: -74,
      checkOutOffset: -70,
      guestCount: 2,
      status: "COMPLETED" as const,
      createdOffset: -98,
      paymentMethod: "BANK_TRANSFER" as const,
      processedOffset: -97,
    },
    {
      villaKey: "batuKarang",
      guestKey: "guestLucas",
      checkInOffset: -63,
      checkOutOffset: -58,
      guestCount: 6,
      status: "COMPLETED" as const,
      createdOffset: -87,
      paymentMethod: "PAYPAL" as const,
      processedOffset: -86,
    },
    {
      villaKey: "cangguCourtyard",
      guestKey: "guestMika",
      checkInOffset: -46,
      checkOutOffset: -42,
      guestCount: 3,
      status: "COMPLETED" as const,
      createdOffset: -69,
      paymentMethod: "CREDIT_CARD" as const,
      processedOffset: -68,
    },
    {
      villaKey: "sidemenRidge",
      guestKey: "guestOwen",
      checkInOffset: -30,
      checkOutOffset: -26,
      guestCount: 2,
      status: "COMPLETED" as const,
      createdOffset: -51,
      paymentMethod: "BANK_TRANSFER" as const,
      processedOffset: -50,
    },
    {
      villaKey: "cangguCourtyard",
      guestKey: "guestPrimary",
      checkInOffset: -18,
      checkOutOffset: -14,
      guestCount: 4,
      status: "COMPLETED" as const,
      createdOffset: -39,
      paymentMethod: "CREDIT_CARD" as const,
      processedOffset: -38,
    },
    {
      villaKey: "sesehTide",
      guestKey: "guestLucas",
      checkInOffset: -1,
      checkOutOffset: 3,
      guestCount: 5,
      status: "CONFIRMED" as const,
      createdOffset: -12,
      paymentMethod: "CREDIT_CARD" as const,
      processedOffset: -11,
    },
    {
      villaKey: "batuKarang",
      guestKey: "guestPrimary",
      checkInOffset: -3,
      checkOutOffset: 2,
      guestCount: 8,
      status: "CONFIRMED" as const,
      createdOffset: -20,
      paymentMethod: "BANK_TRANSFER" as const,
      processedOffset: -19,
    },
    {
      villaKey: "ubudCanopy",
      guestKey: "guestAyu",
      checkInOffset: 6,
      checkOutOffset: 10,
      guestCount: 2,
      status: "CONFIRMED" as const,
      createdOffset: -2,
      paymentMethod: "PAYPAL" as const,
      processedOffset: -1,
    },
    {
      villaKey: "cangguCourtyard",
      guestKey: "guestMika",
      checkInOffset: 12,
      checkOutOffset: 16,
      guestCount: 4,
      status: "CONFIRMED" as const,
      createdOffset: 0,
      paymentMethod: "CREDIT_CARD" as const,
      processedOffset: 1,
    },
    {
      villaKey: "sidemenRidge",
      guestKey: "guestOwen",
      checkInOffset: 20,
      checkOutOffset: 25,
      guestCount: 3,
      status: "CONFIRMED" as const,
      createdOffset: 4,
      paymentMethod: "BANK_TRANSFER" as const,
      processedOffset: 5,
    },
    {
      villaKey: "sesehTide",
      guestKey: "guestPrimary",
      checkInOffset: 9,
      checkOutOffset: 12,
      guestCount: 4,
      status: "PENDING" as const,
      createdOffset: 1,
      paymentMethod: "PAYPAL" as const,
    },
    {
      villaKey: "batuKarang",
      guestKey: "guestLucas",
      checkInOffset: 32,
      checkOutOffset: 36,
      guestCount: 7,
      status: "PENDING" as const,
      createdOffset: 6,
      paymentMethod: "BANK_TRANSFER" as const,
    },
    {
      villaKey: "ubudCanopy",
      guestKey: "guestPrimary",
      checkInOffset: 3,
      checkOutOffset: 6,
      guestCount: 2,
      status: "CANCELLED" as const,
      createdOffset: -5,
      paymentMethod: "CREDIT_CARD" as const,
      processedOffset: -4,
    },
    {
      villaKey: "cangguCourtyard",
      guestKey: "guestMika",
      checkInOffset: 18,
      checkOutOffset: 21,
      guestCount: 3,
      status: "CANCELLED" as const,
      createdOffset: 2,
      paymentMethod: "PAYPAL" as const,
      processedOffset: 3,
    },
  ];

  const bookingRecords = bookingSeeds.map((seed, index) => {
    const villa = villasByKey[seed.villaKey as keyof typeof villasByKey];
    const guest = usersByKey[seed.guestKey as keyof typeof usersByKey];
    const nights = Math.ceil(
      (dateOffset(seed.checkOutOffset).getTime() - dateOffset(seed.checkInOffset).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const totalAmount = money(villa.pricePerNight * nights);
    const bookingId = uuid();

    const paymentStatus: "UNPAID" | "PAID" | "REFUNDED" =
      seed.status === "PENDING"
        ? "UNPAID"
        : seed.status === "CANCELLED"
          ? "REFUNDED"
          : "PAID";

    return {
      booking: {
        id: bookingId,
        villaId: villa.id,
        guestId: guest.id,
        checkInDate: isoDate(seed.checkInOffset),
        checkOutDate: isoDate(seed.checkOutOffset),
        guestCount: seed.guestCount,
        totalAmount,
        status: seed.status,
        createdAt: isoTimestamp(seed.createdOffset, 10 + (index % 6)),
      },
      payment: {
        id: uuid(),
        bookingId,
        amount: totalAmount,
        paymentMethod: seed.paymentMethod,
        transactionId: transactionId(index),
        status: paymentStatus,
        processedAt:
          seed.processedOffset === undefined
            ? null
            : isoTimestamp(seed.processedOffset, 11 + (index % 5)),
      },
    };
  });

  await db.insert(bookings).values(bookingRecords.map((record) => record.booking));
  await db.insert(payments).values(bookingRecords.map((record) => record.payment));

  console.log(`  ✅ Bookings seeded (${bookingRecords.length} bookings)`);
  console.log(`  ✅ Payments seeded (${bookingRecords.length} payments)`);

  const reviewSeeds = [
    {
      bookingIndex: 0,
      rating: 5,
      comment:
        "The sunset side of the villa is exactly what sold the stay. Easy beach access, calm staff, and a layout that still felt private even with four adults.",
      createdOffset: -89,
    },
    {
      bookingIndex: 1,
      rating: 4,
      comment:
        "Really good for a quieter Ubud base. The plunge pool and garden terrace were the parts we used the most, especially in the late afternoon.",
      createdOffset: -68,
    },
    {
      bookingIndex: 2,
      rating: 5,
      comment:
        "Large enough for a family trip without feeling spread out. The master suite and pool deck were the strongest parts of the estate.",
      createdOffset: -56,
    },
    {
      bookingIndex: 3,
      rating: 5,
      comment:
        "The location was convenient, but the villa still felt tucked away once we were inside. Good pool size and better kitchen setup than expected.",
      createdOffset: -40,
    },
    {
      bookingIndex: 4,
      rating: 4,
      comment:
        "Cooler evenings, a proper garden outlook, and enough space to stay in for most of the trip. Best fit for guests who want slower days.",
      createdOffset: -24,
    },
  ];

  const reviewRecords = reviewSeeds.map((seed) => {
    const booking = bookingRecords[seed.bookingIndex]?.booking;

    if (!booking) {
      throw new Error(`Missing booking record for review index ${seed.bookingIndex}`);
    }

    return {
      id: uuid(),
      villaId: booking.villaId,
      guestId: booking.guestId,
      rating: seed.rating,
      comment: seed.comment,
      createdAt: isoTimestamp(seed.createdOffset, 16),
    };
  });

  await db.insert(reviews).values(reviewRecords);
  console.log(`  ✅ Reviews seeded (${reviewRecords.length} reviews)`);

  console.log("\n🎉 Database seeded successfully!");
  console.log(`   Users:    ${userSeeds.length}`);
  console.log(`   Villas:   ${villaSeeds.length}`);
  console.log(`   Bookings: ${bookingRecords.length}`);
  console.log(`   Payments: ${bookingRecords.length}`);
  console.log(`   Reviews:  ${reviewRecords.length}`);
  console.log("\n   Demo login credentials:");
  console.log("   Super Admin: superadmin@resortsgeh.test / password123");
  console.log("   Admin:       admin@resortsgeh.test / password123");
  console.log("   Guest:       guest@resortsgeh.test / password123");
  console.log("   Extra guest records are also seeded for admin realism.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
