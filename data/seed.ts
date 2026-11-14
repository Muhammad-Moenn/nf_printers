import { config } from "dotenv";
import {
  OrderStatus,
  PaymentStatus,
  PricingConfidence,
  PricingSource,
  PricingStatus,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";

config({ quiet: true });
config({ path: ".env.local", override: true, quiet: true });

const prisma = new PrismaClient();
const DAY_MS = 86_400_000;
const NOW = new Date();

function daysBefore(days: number, hour = 10) {
  if (days === 0) {
    return new Date(NOW.getTime() - 60 * 60 * 1000);
  }
  const date = new Date(NOW.getTime() - days * DAY_MS);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function notInFuture(date: Date) {
  return new Date(Math.min(date.getTime(), NOW.getTime() - 30 * 60 * 1000));
}

const seedUsers = [
  { key: "moeen", email: "muhammadmoeen3610@gmail.com", firstName: "Muhammad", lastName: "Moeen", role: Role.CUSTOMER, monthsAgo: 8 },
  { key: "mian", email: "mianmuhammadmoeen3610@gmail.com", firstName: "Mian Muhammad", lastName: "Moeen", role: Role.CUSTOMER, monthsAgo: 7 },
  { key: "huzaifa", email: "huzaifaameer098@gmail.com", firstName: "Muhammad Huzaifa", lastName: "Ameer", role: Role.CUSTOMER, monthsAgo: 5 },
  { key: "nf", email: "nfprinter3610@gmail.com", firstName: "NF", lastName: "Printers", role: Role.CUSTOMER, monthsAgo: 4 },
  { key: "ayesha", email: "seed.ayesha.khan@nfprinters.test", firstName: "Ayesha", lastName: "Khan", role: Role.CUSTOMER, monthsAgo: 6 },
  { key: "bilal", email: "seed.bilal.ahmed@nfprinters.test", firstName: "Bilal", lastName: "Ahmed", role: Role.CUSTOMER, monthsAgo: 3 },
  { key: "sara", email: "seed.sara.ali@nfprinters.test", firstName: "Sara", lastName: "Ali", role: Role.CUSTOMER, monthsAgo: 2 },
  { key: "hamza", email: "seed.hamza.raza@nfprinters.test", firstName: "Hamza", lastName: "Raza", role: Role.EMPLOYEE, monthsAgo: 1 },
] as const;

const seedServices = [
  { name: "Book Printing", slug: "book-printing", category: "Books", description: "Perfect-bound and hardcover book printing for short and bulk runs.", details: "Choose paper, binding and finishing options for books, manuals and catalogues.", features: ["Perfect binding", "Hardcover option", "Bulk pricing"], options: ["Perfect bound", "Hardcover", "Saddle stitch"], idealFor: ["Publishers", "Schools", "Businesses"], icon: "bookOpen", basePrice: 1500, priceUnit: "book", displayOrder: 1 },
  { name: "Lamination Services", slug: "lamination-services", category: "Finishing", description: "Gloss and matte lamination for documents, menus and covers.", details: "Protect printed material with durable gloss or matte lamination.", features: ["Gloss finish", "Matte finish", "Scratch resistant"], options: ["Gloss", "Matte", "Soft touch"], idealFor: ["Restaurants", "Offices", "Students"], icon: "layers", basePrice: 250, priceUnit: "job", displayOrder: 2 },
  { name: "Calendar Printing", slug: "calendar-printing", category: "Marketing", description: "Desk and wall calendars with custom branding and binding.", details: "Seasonal and year-round calendars printed on premium card stock.", features: ["Custom branding", "Spiral binding", "Premium stock"], options: ["Desk calendar", "Wall calendar", "Mini calendar"], idealFor: ["Corporate gifts", "Retail", "Events"], icon: "calendarDays", basePrice: 800, priceUnit: "calendar", displayOrder: 3 },
  { name: "Business Cards", slug: "business-cards", category: "Marketing", description: "Premium business cards with matte, gloss and spot UV finishes.", details: "Standard and premium cards with optional lamination and spot UV.", features: ["Spot UV", "Premium card stock", "Fast turnaround"], options: ["Matte", "Gloss", "Spot UV"], idealFor: ["Professionals", "Startups", "Agencies"], icon: "sticker", basePrice: 450, priceUnit: "pack", displayOrder: 4 },
  { name: "Flyer Printing", slug: "flyer-printing", category: "Marketing", description: "Full-colour promotional flyers in A4, A5 and custom sizes.", details: "High-volume flyer printing for campaigns, events and retail promotions.", features: ["Full colour", "Bulk pricing", "Custom sizes"], options: ["A4", "A5", "DL"], idealFor: ["Campaigns", "Events", "Retail"], icon: "fileText", basePrice: 300, priceUnit: "pack", displayOrder: 5 },
  { name: "Banner Printing", slug: "banner-printing", category: "Large Format", description: "Vinyl and fabric banners for indoor and outdoor displays.", details: "Durable large-format banners with eyelets, hemming and stands.", features: ["Weather resistant", "Eyelets included", "Custom sizes"], options: ["Vinyl", "Fabric", "Backdrop"], idealFor: ["Events", "Shops", "Exhibitions"], icon: "printer", basePrice: 1200, priceUnit: "banner", displayOrder: 6 },
] as const;

const seedDesigns = [
  { id: "seed_design_moeen_1", userKey: "moeen", key: "seed-moeen-design-1", name: "Anniversary Invitation.pdf", type: "application/pdf", size: 384_000, daysAgo: 2 },
  { id: "seed_design_moeen_2", userKey: "moeen", key: "seed-moeen-design-2", name: "Book Cover Final.ai", type: "application/postscript", size: 1_240_000, daysAgo: 6 },
  { id: "seed_design_mian_1", userKey: "mian", key: "seed-mian-design-1", name: "Thesis Layout.pdf", type: "application/pdf", size: 860_000, daysAgo: 4 },
  { id: "seed_design_ayesha_1", userKey: "ayesha", key: "seed-ayesha-design-1", name: "Recipe Book Interior.pdf", type: "application/pdf", size: 1_100_000, daysAgo: 3 },
  { id: "seed_design_huzaifa_1", userKey: "huzaifa", key: "seed-huzaifa-design-1", name: "Backdrop Artwork.png", type: "image/png", size: 2_300_000, daysAgo: 5 },
] as const;

const seedOrders = [
  { id: "seed_ord_moeen_01", userKey: "moeen", daysAgo: 0, status: OrderStatus.completed, service: "Book Printing", product: "Hardcover Notebook Set", quantity: "120", amount: 4800, paymentStatus: PaymentStatus.paid, designKeys: ["seed-moeen-design-1"], isReorder: false, requirements: "Navy hardcover with gold foil title, 120 notebooks." },
  { id: "seed_ord_moeen_02", userKey: "moeen", daysAgo: 2, status: OrderStatus.completed, service: "Lamination Services", product: "Matte Lamination — 500 sheets", quantity: "500", amount: 2250, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Matte lamination for 500 A4 sheets, trimmed clean." },
  { id: "seed_ord_moeen_03", userKey: "moeen", daysAgo: 5, status: OrderStatus.completed, service: "Calendar Printing", product: "Desk Calendar 2027", quantity: "80", amount: 3200, paymentStatus: PaymentStatus.paid, designKeys: ["seed-moeen-design-2"], isReorder: false, requirements: "Spiral-bound desk calendars with logo on every page." },
  { id: "seed_ord_moeen_04", userKey: "moeen", daysAgo: 8, status: OrderStatus.completed, service: "Business Cards", product: "Premium Business Cards", quantity: "1000", amount: 1750, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: true, requirements: "350gsm matte cards with spot UV on the logo." },
  { id: "seed_ord_moeen_05", userKey: "moeen", daysAgo: 22, status: OrderStatus.completed, service: "Flyer Printing", product: "A5 Promotional Flyers", quantity: "2000", amount: 2900, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Full-colour double-sided flyers, 130gsm gloss." },
  { id: "seed_ord_moeen_06", userKey: "moeen", daysAgo: 1, status: OrderStatus.pending, service: "Banner Printing", product: "Vinyl Banner 6×3 ft", quantity: "4", amount: 1200, paymentStatus: PaymentStatus.unpaid, designKeys: [], isReorder: false, requirements: "Outdoor vinyl banners with eyelets on all corners." },
  { id: "seed_ord_moeen_07", userKey: "moeen", daysAgo: 3, status: OrderStatus.in_progress, service: "Book Printing", product: "Perfect Bound Book", quantity: "250", amount: 5600, paymentStatus: PaymentStatus.unpaid, designKeys: [], isReorder: false, requirements: "Perfect bound books, 170gsm interior, matte cover." },
  { id: "seed_ord_moeen_08", userKey: "moeen", daysAgo: 12, status: OrderStatus.processing, service: "Flyer Printing", product: "A4 Product Flyers", quantity: "1500", amount: 2100, paymentStatus: PaymentStatus.unpaid, designKeys: [], isReorder: true, requirements: "Single-sided A4 flyers on 150gsm paper." },
  { id: "seed_ord_moeen_09", userKey: "moeen", daysAgo: 30, status: OrderStatus.cancelled, service: "Business Cards", product: "Spot UV Business Cards", quantity: "500", amount: 1400, paymentStatus: PaymentStatus.refunded, designKeys: [], isReorder: false, requirements: "Cancelled after artwork review; refund requested." },
  { id: "seed_ord_moeen_10", userKey: "moeen", daysAgo: 75, status: OrderStatus.completed, service: "Calendar Printing", product: "Wall Calendar 2027", quantity: "150", amount: 4100, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "A3 wall calendars with wire binding." },
  { id: "seed_ord_moeen_11", userKey: "moeen", daysAgo: 110, status: OrderStatus.completed, service: "Book Printing", product: "Softcover Course Books", quantity: "300", amount: 6300, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Softcover course books with laminated covers." },
  { id: "seed_ord_moeen_12", userKey: "moeen", daysAgo: 200, status: OrderStatus.completed, service: "Lamination Services", product: "Gloss Lamination — 800 sheets", quantity: "800", amount: 1900, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Gloss lamination for presentation handouts." },
  { id: "seed_ord_mian_01", userKey: "mian", daysAgo: 1, status: OrderStatus.pending, service: "Book Printing", product: "Thesis Printing (6 copies)", quantity: "6", amount: 2400, paymentStatus: PaymentStatus.unpaid, designKeys: ["seed-mian-design-1"], isReorder: false, requirements: "Hardbound thesis copies with gold embossing." },
  { id: "seed_ord_mian_02", userKey: "mian", daysAgo: 9, status: OrderStatus.completed, service: "Lamination Services", product: "Document Lamination", quantity: "120", amount: 980, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Laminated certificates and legal documents." },
  { id: "seed_ord_mian_03", userKey: "mian", daysAgo: 48, status: OrderStatus.completed, service: "Flyer Printing", product: "Promo Flyers", quantity: "1000", amount: 1650, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Promotional flyers for a local event." },
  { id: "seed_ord_mian_04", userKey: "mian", daysAgo: 100, status: OrderStatus.completed, service: "Business Cards", product: "Standard Business Cards", quantity: "500", amount: 850, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: true, requirements: "Standard matte cards with rounded corners." },
  { id: "seed_ord_huzaifa_01", userKey: "huzaifa", daysAgo: 4, status: OrderStatus.in_progress, service: "Banner Printing", product: "Backdrop Banner", quantity: "2", amount: 3600, paymentStatus: PaymentStatus.unpaid, designKeys: ["seed-huzaifa-design-1"], isReorder: false, requirements: "Fabric backdrop 10×8 ft for a conference stage." },
  { id: "seed_ord_huzaifa_02", userKey: "huzaifa", daysAgo: 35, status: OrderStatus.completed, service: "Book Printing", product: "Course Pack", quantity: "80", amount: 3100, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Spiral-bound course packs with dividers." },
  { id: "seed_ord_nf_01", userKey: "nf", daysAgo: 0, status: OrderStatus.completed, service: "Flyer Printing", product: "Sample Flyer Pack", quantity: "250", amount: 1200, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Sample pack for the showroom display." },
  { id: "seed_ord_nf_02", userKey: "nf", daysAgo: 7, status: OrderStatus.pending, service: "Business Cards", product: "Sample Business Card Pack", quantity: "100", amount: 450, paymentStatus: PaymentStatus.unpaid, designKeys: [], isReorder: false, requirements: "Assorted sample cards for customer review." },
  { id: "seed_ord_ayesha_01", userKey: "ayesha", daysAgo: 3, status: OrderStatus.processing, service: "Book Printing", product: "Recipe Book Printing", quantity: "60", amount: 5200, paymentStatus: PaymentStatus.unpaid, designKeys: ["seed-ayesha-design-1"], isReorder: false, requirements: "Hardcover recipe books with full-colour pages." },
  { id: "seed_ord_ayesha_02", userKey: "ayesha", daysAgo: 16, status: OrderStatus.completed, service: "Lamination Services", product: "Menu Lamination", quantity: "40", amount: 720, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: true, requirements: "Matte laminated menus, double-sided." },
  { id: "seed_ord_ayesha_03", userKey: "ayesha", daysAgo: 96, status: OrderStatus.completed, service: "Calendar Printing", product: "Mini Desk Calendars", quantity: "200", amount: 2400, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Mini calendars for a corporate giveaway." },
  { id: "seed_ord_bilal_01", userKey: "bilal", daysAgo: 6, status: OrderStatus.completed, service: "Business Cards", product: "Matte Business Cards", quantity: "1000", amount: 1450, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Matte cards with a clean single-colour back." },
  { id: "seed_ord_bilal_02", userKey: "bilal", daysAgo: 18, status: OrderStatus.pending, service: "Banner Printing", product: "Shop Banner", quantity: "1", amount: 1800, paymentStatus: PaymentStatus.unpaid, designKeys: [], isReorder: false, requirements: "Storefront banner with reinforced edges." },
  { id: "seed_ord_bilal_03", userKey: "bilal", daysAgo: 140, status: OrderStatus.completed, service: "Flyer Printing", product: "Event Flyers", quantity: "3000", amount: 2750, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Event flyers with a QR code on the reverse." },
  { id: "seed_ord_sara_01", userKey: "sara", daysAgo: 121, status: OrderStatus.completed, service: "Book Printing", product: "Portfolio Book", quantity: "25", amount: 2200, paymentStatus: PaymentStatus.paid, designKeys: [], isReorder: false, requirements: "Portfolio books with lay-flat binding." },
  { id: "seed_ord_sara_02", userKey: "sara", daysAgo: 11, status: OrderStatus.processing, service: "Calendar Printing", product: "Desk Calendar", quantity: "50", amount: 1600, paymentStatus: PaymentStatus.unpaid, designKeys: [], isReorder: true, requirements: "Desk calendars with a stand and custom cover." },
] as const;

const seedExpenses = [
  { id: "seed_exp_01", amount: 4200, category: "Paper & Ink", description: "Bulk paper stock and CMYK inks", daysAgo: 3 },
  { id: "seed_exp_02", amount: 1500, category: "Shipping", description: "Courier deliveries for completed orders", daysAgo: 6 },
  { id: "seed_exp_03", amount: 2600, category: "Equipment", description: "Preventive maintenance for the offset press", daysAgo: 10 },
  { id: "seed_exp_04", amount: 900, category: "Marketing", description: "Local advertising and print samples", daysAgo: 22 },
  { id: "seed_exp_05", amount: 3100, category: "Paper & Ink", description: "Card stock and lamination film", daysAgo: 40 },
  { id: "seed_exp_06", amount: 1200, category: "Utilities", description: "Electricity and workshop utilities", daysAgo: 70 },
  { id: "seed_exp_07", amount: 2300, category: "Software", description: "Design and workflow subscriptions", daysAgo: 100 },
  { id: "seed_exp_08", amount: 1800, category: "Packaging", description: "Boxes, wrapping and protective packaging", daysAgo: 130 },
] as const;

const seedConversations = [
  {
    userKey: "moeen",
    messages: [
      { id: "seed_msg_moeen_1", from: "user", text: "Hi, can you confirm the paper stock for the hardcover notebooks?", seen: true, daysAgo: 2 },
      { id: "seed_msg_moeen_2", from: "admin", text: "We are using 100gsm cream paper with a 2.5mm grey board cover.", seen: true, daysAgo: 2 },
      { id: "seed_msg_moeen_3", from: "user", text: "That works. Please add a ribbon marker if possible.", seen: true, daysAgo: 1 },
      { id: "seed_msg_moeen_4", from: "admin", text: "Ribbon markers are available. I have added them to the job.", seen: true, daysAgo: 1 },
      { id: "seed_msg_moeen_5", from: "user", text: "Perfect, thank you. When will the order be ready?", seen: false, daysAgo: 0 },
    ],
  },
  {
    userKey: "mian",
    messages: [
      { id: "seed_msg_mian_1", from: "user", text: "I need six hardbound thesis copies. Can the title be gold embossed?", seen: true, daysAgo: 2 },
      { id: "seed_msg_mian_2", from: "admin", text: "Yes, gold foil embossing is included in the hardbound option.", seen: true, daysAgo: 1 },
      { id: "seed_msg_mian_3", from: "user", text: "Great, I have uploaded the final layout.", seen: false, daysAgo: 0 },
    ],
  },
  {
    userKey: "ayesha",
    messages: [
      { id: "seed_msg_ayesha_1", from: "user", text: "Can you share a proof of the recipe book cover before printing?", seen: true, daysAgo: 3 },
      { id: "seed_msg_ayesha_2", from: "admin", text: "We will send a digital proof today for approval.", seen: true, daysAgo: 3 },
      { id: "seed_msg_ayesha_3", from: "admin", text: "The proof is attached in your design library.", seen: false, daysAgo: 1 },
    ],
  },
  {
    userKey: "bilal",
    messages: [
      { id: "seed_msg_bilal_1", from: "user", text: "What is the smallest quantity you can print for shop banners?", seen: true, daysAgo: 4 },
      { id: "seed_msg_bilal_2", from: "admin", text: "We can print a single banner. Eyelets and hemming are included.", seen: true, daysAgo: 3 },
    ],
  },
] as const;

const paperTypes = ["Glossy", "Matte", "Art Card", "Offset"];
const sizes = ["A4", "A5", "17×27", "18×28", "20×30"];
const gsmOptions = ["130", "170", "250", "300"];
const colorModes = ["Two Color (CMYK)", "Full Color (CMYK)", "Black"];
const sidesOptions = ["Single Side", "Double Side (use single copy)"];
const finishingSets = [["Cutting"], ["Lamination"], ["Folding", "Stapling"], ["Cutting", "Lamination"]];
const paymentMethods = ["card", "bank_transfer", "cash"];

async function seedUserRows() {
  const userIds = new Map<string, string>();

  for (const user of seedUsers) {
    const createdAt = new Date(
      NOW.getFullYear(),
      NOW.getMonth() - user.monthsAgo,
      15,
      9,
      0,
      0,
      0
    );
    const row = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt,
      },
      update: {},
      select: { id: true },
    });
    userIds.set(user.key, row.id);
  }

  return userIds;
}

async function seedServiceRows() {
  for (const service of seedServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: {
        name: service.name,
        slug: service.slug,
        category: service.category,
        description: service.description,
        details: service.details,
        features: [...service.features],
        options: [...service.options],
        idealFor: [...service.idealFor],
        icon: service.icon,
        pricingMethod: "FIXED",
        basePrice: service.basePrice,
        priceUnit: service.priceUnit,
        displayOrder: service.displayOrder,
      },
      update: {},
    });
  }
}

async function seedDesignRows(userIds: Map<string, string>) {
  const designsByKey = new Map<
    string,
    { key: string; url: string; name: string; type: string; size: number }
  >();

  for (const design of seedDesigns) {
    const userId = userIds.get(design.userKey);
    if (!userId) {
      throw new Error(`Missing user for design ${design.id}`);
    }
    const url = `https://seed-assets.ufs.sh/f/${design.key}`;
    const createdAt = daysBefore(design.daysAgo);
    const data: Prisma.DesignsUncheckedCreateInput = {
      id: design.id,
      url,
      key: design.key,
      size: design.size,
      userId,
      createdAt,
    };

    await prisma.designs.upsert({
      where: { id: design.id },
      create: data,
      update: data,
    });

    designsByKey.set(design.key, {
      key: design.key,
      url,
      name: design.name,
      type: design.type,
      size: design.size,
    });
  }

  return designsByKey;
}

async function seedOrderRows(
  userIds: Map<string, string>,
  designsByKey: Map<
    string,
    { key: string; url: string; name: string; type: string; size: number }
  >,
  adminId: string
) {
  for (const [index, order] of seedOrders.entries()) {
    const userId = userIds.get(order.userKey);
    if (!userId) {
      throw new Error(`Missing user for order ${order.id}`);
    }

    const orderDate = daysBefore(order.daysAgo);
    const isCompleted = order.status === OrderStatus.completed;
    const isCancelled = order.status === OrderStatus.cancelled;
    const isReviewed = order.status !== OrderStatus.pending;
    const designs = order.designKeys.map((key) => {
      const design = designsByKey.get(key);
      if (!design) {
        throw new Error(`Missing design ${key} for order ${order.id}`);
      }
      return design;
    });

    const data: Prisma.OrderUncheckedCreateInput = {
      id: order.id,
      userId,
      product: order.product,
      service: order.service,
      quantity: order.quantity,
      quantityValue: Number(order.quantity),
      amount: String(order.amount),
      estimatedAmount: order.amount,
      finalAmount: isCompleted ? order.amount : null,
      pricingSource: PricingSource.RULE_BASED,
      pricingConfidence: isCancelled ? PricingConfidence.MEDIUM : PricingConfidence.HIGH,
      pricingStatus: isCancelled
        ? PricingStatus.OVERRIDDEN
        : isReviewed
          ? PricingStatus.APPROVED
          : PricingStatus.PENDING_REVIEW,
      pricingBreakdown: {
        basePrice: order.amount,
        quantity: Number(order.quantity),
        total: order.amount,
      },
      pricingFeatures: {
        paperType: paperTypes[index % paperTypes.length],
        size: sizes[index % sizes.length],
        gsm: gsmOptions[index % gsmOptions.length],
        colorMode: colorModes[index % colorModes.length],
        sides: sidesOptions[index % sidesOptions.length],
      },
      pricingModelVersion: "seed-v1",
      adminAdjusted: isCancelled,
      adjustmentReason: isCancelled ? "Cancelled after artwork review" : null,
      priceReviewedById: isReviewed ? adminId : null,
      priceEstimatedAt: orderDate,
      priceReviewedAt: isReviewed ? addDays(orderDate, 1) : null,
      status: order.status,
      orderDate,
      deliveryDate: isCancelled
        ? null
        : addDays(orderDate, order.status === OrderStatus.pending ? 7 : 3),
      paperType: paperTypes[index % paperTypes.length],
      size: sizes[index % sizes.length],
      gsm: gsmOptions[index % gsmOptions.length],
      colorMode: colorModes[index % colorModes.length],
      sides: sidesOptions[index % sidesOptions.length],
      finishingOptions: [...finishingSets[index % finishingSets.length]],
      requirements: order.requirements,
      isReorder: order.isReorder,
      designs,
      createdAt: orderDate,
    };

    await prisma.order.upsert({
      where: { id: order.id },
      create: data,
      update: data,
    });

    const paymentDate =
      order.paymentStatus === PaymentStatus.paid
        ? notInFuture(addDays(orderDate, 1))
        : order.paymentStatus === PaymentStatus.refunded
          ? notInFuture(addDays(orderDate, 2))
          : orderDate;
    const paymentData = {
      method:
        order.paymentStatus === PaymentStatus.unpaid
          ? null
          : order.paymentStatus === PaymentStatus.refunded
            ? "card"
            : paymentMethods[index % paymentMethods.length],
      status: order.paymentStatus,
      reference: `SEED-${order.id.toUpperCase()}`,
      amount: order.amount,
      createdAt: paymentDate,
    };

    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, ...paymentData },
      update: paymentData,
    });
  }
}

async function seedExpenseRows(adminId: string) {
  for (const expense of seedExpenses) {
    const expenseDate = daysBefore(expense.daysAgo);
    const data: Prisma.ExpenseUncheckedCreateInput = {
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      expenseDate,
      createdById: adminId,
      createdAt: expenseDate,
    };

    await prisma.expense.upsert({
      where: { id: expense.id },
      create: data,
      update: data,
    });
  }
}

async function seedMessageRows(
  userIds: Map<string, string>,
  adminId: string
) {
  for (const conversationSeed of seedConversations) {
    const userId = userIds.get(conversationSeed.userKey);
    if (!userId) {
      throw new Error(`Missing user for conversation ${conversationSeed.userKey}`);
    }

    const conversation = await prisma.conversation.upsert({
      where: { userId },
      create: { userId, adminId },
      update: { adminId },
      select: { id: true },
    });

    for (const message of conversationSeed.messages) {
      const createdAt = daysBefore(message.daysAgo, 11);
      const isFromUser = message.from === "user";
      const data: Prisma.MessageUncheckedCreateInput = {
        id: message.id,
        conversationId: conversation.id,
        senderId: isFromUser ? userId : adminId,
        receiverId: isFromUser ? adminId : userId,
        text: message.text,
        seen: message.seen,
        createdAt,
      };

      await prisma.message.upsert({
        where: { id: message.id },
        create: data,
        update: data,
      });
    }
  }
}

async function clearDashboardCache() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    return 0;
  }

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url,
    token,
    automaticDeserialization: false,
    enableTelemetry: false,
  });
  const keys = await redis.keys("nf:v2:*");
  if (!keys.length) {
    return 0;
  }
  await redis.del(...keys);
  return keys.length;
}

async function logSummary(cacheKeysCleared: number) {
  const [userGroups, orderGroups, revenue, payments, topServices] =
    await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.aggregate({
        where: { status: OrderStatus.completed },
        _sum: { finalAmount: true },
      }),
      prisma.payment.groupBy({ by: ["status"], _sum: { amount: true } }),
      prisma.order.groupBy({
        by: ["service"],
        _count: { _all: true },
        orderBy: { _count: { service: "desc" } },
        take: 5,
      }),
    ]);

  console.log("Seed complete");
  console.log("Users:", Object.fromEntries(userGroups.map((row) => [row.role, row._count._all])));
  console.log("Orders:", Object.fromEntries(orderGroups.map((row) => [row.status, row._count._all])));
  console.log("Completed revenue:", Number(revenue._sum.finalAmount ?? 0));
  console.log("Payments:", Object.fromEntries(payments.map((row) => [row.status, row._sum.amount ?? 0])));
  console.log("Top services:", topServices.map((row) => `${row.service} (${row._count._all})`).join(", "));
  console.log("Cache keys cleared:", cacheKeysCleared);
}

async function main() {
  const userIds = await seedUserRows();
  const admin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) {
    throw new Error("An ADMIN user is required to seed dashboard data.");
  }

  await seedServiceRows();
  const designsByKey = await seedDesignRows(userIds);
  await seedOrderRows(userIds, designsByKey, admin.id);
  await seedExpenseRows(admin.id);
  await seedMessageRows(userIds, admin.id);
  const cleared = await clearDashboardCache();
  await logSummary(cleared);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
