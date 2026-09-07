import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEV_ADMIN_EMAIL = "admin@partyspace.local";
const DEV_ADMIN_PASSWORD = "AdminDev123!";

const MOCK_PASSWORD = "Test@1234";

type MockKyc =
  | { status: "NOT_SUBMITTED" }
  | { status: "PENDING" }
  | { status: "APPROVED" }
  | { status: "REJECTED"; reason: string };

type MockUser = {
  email: string;
  name: string;
  phone: string;
  city: string;
  role: "OWNER" | "HOST";
  emailVerified: boolean;
  kyc: MockKyc;
};

const mockUsers: MockUser[] = [
  {
    email: "owner1@test.com",
    name: "Rahul Mehta",
    phone: "+919800000001",
    city: "Mumbai",
    role: "OWNER",
    emailVerified: true,
    kyc: { status: "APPROVED" },
  },
  {
    email: "owner2@test.com",
    name: "Priya Sharma",
    phone: "+919800000002",
    city: "Bengaluru",
    role: "OWNER",
    emailVerified: true,
    kyc: { status: "PENDING" },
  },
  {
    email: "owner3@test.com",
    name: "Karan Malhotra",
    phone: "+919800000003",
    city: "Delhi",
    role: "OWNER",
    emailVerified: false,
    kyc: { status: "NOT_SUBMITTED" },
  },
  {
    email: "host1@test.com",
    name: "Ananya Rao",
    phone: "+919800000011",
    city: "Pune",
    role: "HOST",
    emailVerified: true,
    kyc: { status: "APPROVED" },
  },
  {
    email: "host2@test.com",
    name: "Vikram Singh",
    phone: "+919800000012",
    city: "Hyderabad",
    role: "HOST",
    emailVerified: true,
    kyc: { status: "REJECTED", reason: "ID photo is blurry — please reupload a clearer copy." },
  },
  {
    email: "host3@test.com",
    name: "Sneha Iyer",
    phone: "+919800000013",
    city: "Chennai",
    role: "HOST",
    emailVerified: true,
    kyc: { status: "PENDING" },
  },
];

const houseRules: Array<{
  code: string;
  label: string;
  category:
    | "MUSIC"
    | "ALCOHOL"
    | "SMOKING"
    | "TIMING"
    | "GUESTS"
    | "SAFETY"
    | "OTHER";
  sortOrder: number;
}> = [
  { code: "music-till-11pm", label: "Music till 11 PM", category: "MUSIC", sortOrder: 10 },
  { code: "music-till-midnight", label: "Music till midnight", category: "MUSIC", sortOrder: 11 },
  { code: "no-loud-music", label: "No loud music or speakers", category: "MUSIC", sortOrder: 12 },
  { code: "alcohol-allowed", label: "Alcohol allowed", category: "ALCOHOL", sortOrder: 20 },
  { code: "no-alcohol", label: "No alcohol", category: "ALCOHOL", sortOrder: 21 },
  { code: "byob-only", label: "Bring your own bottle only", category: "ALCOHOL", sortOrder: 22 },
  { code: "smoking-allowed", label: "Smoking allowed", category: "SMOKING", sortOrder: 30 },
  { code: "no-smoking", label: "No smoking", category: "SMOKING", sortOrder: 31 },
  { code: "designated-smoking-area", label: "Designated smoking area only", category: "SMOKING", sortOrder: 32 },
  { code: "checkin-after-6pm", label: "Check-in only after 6 PM", category: "TIMING", sortOrder: 40 },
  { code: "vacate-by-2am", label: "Vacate by 2 AM", category: "TIMING", sortOrder: 41 },
  { code: "no-overnight-stay", label: "No overnight stay", category: "TIMING", sortOrder: 42 },
  { code: "max-25-guests", label: "Max 25 guests", category: "GUESTS", sortOrder: 50 },
  { code: "max-50-guests", label: "Max 50 guests", category: "GUESTS", sortOrder: 51 },
  { code: "no-outside-guests-after-registration", label: "No unregistered guests at the gate", category: "GUESTS", sortOrder: 52 },
  { code: "id-required-at-gate", label: "Photo ID required at the gate", category: "SAFETY", sortOrder: 60 },
  { code: "no-fireworks", label: "No fireworks or open flames", category: "SAFETY", sortOrder: 61 },
  { code: "security-deposit-required", label: "Security deposit required", category: "SAFETY", sortOrder: 62 },
  { code: "no-pets", label: "No pets", category: "OTHER", sortOrder: 70 },
  { code: "outside-catering-allowed", label: "Outside catering allowed", category: "OTHER", sortOrder: 71 },
  { code: "parking-available", label: "Parking available", category: "OTHER", sortOrder: 72 },
];

const subscriptionPlans = [
  { name: "Starter", slug: "starter", listingLimit: 1, durationMonths: 1, pricePaise: 49900, sortOrder: 10 },
  { name: "Growth", slug: "growth", listingLimit: 3, durationMonths: 3, pricePaise: 129900, sortOrder: 20 },
  { name: "Pro", slug: "pro", listingLimit: 10, durationMonths: 12, pricePaise: 399900, sortOrder: 30 },
];

async function main() {
  for (const rule of houseRules) {
    await prisma.houseRule.upsert({
      where: { code: rule.code },
      update: { label: rule.label, category: rule.category, sortOrder: rule.sortOrder },
      create: rule,
    });
  }

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        listingLimit: plan.listingLimit,
        durationMonths: plan.durationMonths,
        pricePaise: plan.pricePaise,
        sortOrder: plan.sortOrder,
      },
      create: plan,
    });
  }

  console.log(`Seeded ${houseRules.length} house rules and ${subscriptionPlans.length} subscription plans.`);

  // Admins aren't self-registered (see PROJECT_SPEC.md section 4), so local
  // review needs one seeded account. Never runs against a production seed.
  if (process.env.NODE_ENV !== "production") {
    const passwordHash = await bcrypt.hash(DEV_ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: DEV_ADMIN_EMAIL },
      update: {},
      create: {
        email: DEV_ADMIN_EMAIL,
        passwordHash,
        phone: "+910000000000",
        name: "Dev Admin",
        dateOfBirth: new Date("1990-01-01"),
        city: "Bengaluru",
        role: "ADMIN",
        kycStatus: "APPROVED",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      },
    });
    console.log(`Dev admin ready — email: ${DEV_ADMIN_EMAIL} password: ${DEV_ADMIN_PASSWORD}`);

    // Mock owner/host accounts across KYC states, for exercising the
    // dashboards and (once built) the admin KYC queue without registering
    // by hand each time. Never runs against a production seed.
    const mockPasswordHash = await bcrypt.hash(MOCK_PASSWORD, 12);

    for (const mock of mockUsers) {
      const user = await prisma.user.upsert({
        where: { email: mock.email },
        update: {
          kycStatus: mock.kyc.status,
          emailVerifiedAt: mock.emailVerified ? new Date() : null,
        },
        create: {
          email: mock.email,
          passwordHash: mockPasswordHash,
          phone: mock.phone,
          name: mock.name,
          dateOfBirth: new Date("1996-04-12"),
          city: mock.city,
          role: mock.role,
          kycStatus: mock.kyc.status,
          emailVerifiedAt: mock.emailVerified ? new Date() : null,
          phoneVerifiedAt: new Date(),
        },
      });

      if (mock.kyc.status !== "NOT_SUBMITTED") {
        await prisma.kycProfile.upsert({
          where: { userId: user.id },
          update: {
            status: mock.kyc.status,
            reviewNote: mock.kyc.status === "REJECTED" ? mock.kyc.reason : null,
            reviewedAt: mock.kyc.status === "PENDING" ? null : new Date(),
          },
          create: {
            userId: user.id,
            idType: "DRIVING_LICENCE",
            idLastFour: "4821",
            idFileKey: "mock/id-placeholder.jpg",
            selfieFileKey: "mock/selfie-placeholder.jpg",
            addressLine: `12 MG Road, ${mock.city}`,
            pincode: "560001",
            ownershipProofFileKey: mock.role === "OWNER" ? "mock/ownership-placeholder.jpg" : null,
            emergencyContactName: mock.role === "HOST" ? "Emergency Contact" : null,
            emergencyContactPhone: mock.role === "HOST" ? "+919800099999" : null,
            status: mock.kyc.status,
            reviewNote: mock.kyc.status === "REJECTED" ? mock.kyc.reason : null,
            reviewedAt: mock.kyc.status === "PENDING" ? null : new Date(),
          },
        });
      }
    }

    console.log(`Seeded ${mockUsers.length} mock owner/host accounts — password for all: ${MOCK_PASSWORD}`);
    console.log("  " + mockUsers.map((m) => `${m.email} (${m.role}, KYC ${m.kyc.status})`).join("\n  "));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
