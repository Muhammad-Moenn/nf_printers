import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { services } from "../data/services";

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const catalog = [
  ...services.map((service, index) => ({
    name: service.title,
    slug: service.slug ?? slugify(service.title),
    category: "Printing",
    description: service.description,
    details: service.details ?? service.description,
    icon: String(service.icon),
    displayOrder: index + 1,
  })),
  {
    name: "Custom Printing",
    slug: "custom-printing",
    category: "Custom Printing",
    description:
      "Configure a custom printing order to match your requirements through the customer dashboard.",
    details:
      "Choose the custom printing option and provide your order requirements. Available specifications are presented in the dashboard order flow.",
    icon: "printer",
    displayOrder: services.length + 1,
  },
];

async function main() {
  for (const service of catalog) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: { ...service, isActive: true, isFavorite: true },
      update: { ...service, isActive: true, isFavorite: true },
    });
  }

  console.log(`Upserted ${catalog.length} active services.`);
}

main()
  .catch((error: unknown) => {
    console.error("Service seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
