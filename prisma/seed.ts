
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: "user_38ef3QB71AZSpnr7LjV40ejZrwY"  },
  });
  if (!dbUser) throw new Error("User not found in database");

  // Generate 10 dummy orders with unique data
  const dummyOrders = Array.from({ length: 20 }).map((_, i) => ({
  userId: dbUser.id,
  product: `Product ${i + 1}`,
  service: ["Book Printing", "Lamination Services", "Calendar Printing"][i % 3],
  quantity: (10 + i * 5).toString(),
  amount: `${1000 + i * 500}`,
  status: ["pending", "in_progress", "completed", "cancelled"][i % 4], // ✅ fixed
  orderDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
  deliveryDate: i % 2 === 0 ? new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000) : null,
  paperType: ["Glossy", "Matte"][i % 2],
  size: ["17×27", "18×28", "20×30","23×36"][i % 4],
  gsm: ["50", "60", "65"][i % 3],
  colorMode: ["Two Color (CMYK)", "White","Black"][i % 3],
  sides: ["Single Side", "Double Side (use single copy)"][i % 2],
  finishingOptions: i % 2 === 0 ? ["Lamination"] : ["Cutting"],
  designs: [
    {
      key: `dummyKey${i + 1}`,
      url: `https://l26yt3z8q5.ufs.sh/f/dummy${i + 1}`,
    },
  ],
  requirements: `Dummy requirements for order ${i + 1}`,
  isReorder: i % 2 === 0,
}));


  // Insert all dummy orders
    for (const o of dummyOrders) {
    await prisma.order.create({  data: {
      userId: o.userId,
      product: o.product,
      service: o.service,
      quantity: o.quantity,
      amount: o.amount,
      status: o.status as any, // cast to enum if TS complains
      orderDate: o.orderDate || new Date(),
      deliveryDate: o.deliveryDate || null,
      paperType: o.paperType,
      size: o.size,
      gsm: o.gsm,
      colorMode: o.colorMode,
      sides: o.sides,
      finishingOptions: o.finishingOptions || [],
      designs: o.designs || [],
      requirements: o.requirements,
      isReorder: o.isReorder || false,
    }, });
  }

}

  console.log("✅ Seeded 10 dummy orders successfully!");


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
