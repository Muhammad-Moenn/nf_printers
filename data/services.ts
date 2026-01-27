

export interface ServiceProps {
  id: number;
  title: string;
  description: string;
  icon: any;
  link: string;
  iconColor: string;
  iconBg: string;
  details?: string;
  features?: string[];
  options?: string[];
  idealFor?: string[];
  slug?: string;
}
export const services: ServiceProps[] = [
  {
    id: 1,
    title: "Register Printing",
    description:
      "School, college, and office registers printed with durable paper and clean formatting.",
    icon:"notebookPen",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  details:
    "We provide long-lasting register printing designed for daily academic and office use. Our registers are printed with clear ruling, strong binding, and premium paper to ensure durability over time.",
  features: [
    "Strong binding for daily usage",
    "Clear ruling and neat margins",
    "High-quality ink for long-term readability",
    "Custom page count and layouts",
  ],
  options: [
    "A4 / A3 size",
    "Single or double ruling",
    "Soft or hard cover",
  ],
  idealFor: ["Schools", "Colleges", "Offices"],
  link: "/services/register-printing",
  slug: "register-printing",

  },
  {
    id: 2,
    title: "Book Printing",
    description:
      "High-quality book printing including textbooks, novels, manuals, and magazines.",
    icon: "bookOpen",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    details:
    "Our book printing service delivers professional-grade results with excellent paper quality, sharp text, and strong binding. Whether you need educational books or commercial publications, we ensure consistency and accuracy.",
  features: [
    "High-resolution printing",
    "Multiple binding options",
    "Black & white or full color",
    "Bulk and small quantity support",
  ],
  options: [
    "Paperback / Hardcover",
    "Offset & digital printing",
    "Glossy or matte pages",
  ],
  idealFor: ["Authors", "Publishers", "Institutions"],
  link: "/services/book-printing",
  },
  {
    id: 3,
    title: "Title & Cover Printing",
    description:
      "Attractive book titles and covers printed with premium paper and sharp colors.",
    icon: "layers",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
   details:
    "We design and print visually appealing book covers using premium materials. Our printing ensures accurate colors, smooth finishing, and a professional look.",
  features: [
    "Vibrant color printing",
    "Premium cardstock",
    "Lamination available",
  ],
  options: [
    "Glossy / Matte finish",
    "Single or double-sided",
  ],
  idealFor: ["Books", "Reports", "Projects"],
  link: "/services/title-printing",
  },
  {
    id: 4,
    title: "File & Document Printing",
    description:
      "Fast and accurate printing of files, reports, notes, and official documents.",
    icon: "fileText",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    details:
    "We offer quick and precise document printing services suitable for academic and professional needs, maintaining clarity and formatting accuracy.",
  features: [
    "Fast turnaround",
    "Clear text output",
    "Multiple paper options",
  ],
  options: [
    "Black & white / Color",
    "Single / Double-sided",
  ],
  idealFor: ["Students", "Offices", "Businesses"],
  link: "/services/file-printing",
  },
  {
    id: 5,
    title: "Book Binding",
    description:
      "Spiral, soft, hard, and thermal binding for books and documents.",
    icon: "archive",
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    details:
    "Our binding services provide durability and a professional finish, ensuring your documents remain secure and presentable.",
  features: [
    "Strong and neat binding",
    "Custom spine thickness",
    "Durable materials",
  ],
  options: [
    "Spiral",
    "Hard binding",
    "Thermal binding",
  ],
  idealFor: ["Books", "Reports", "Projects"],
  link: "/services/book-binding",
  },
  {
    id: 6,
    title: "Bulk Printing",
    description:
      "Cost-effective bulk printing solutions for businesses and institutions.",
    icon: "printer",
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    details:
    "We specialize in large-scale printing with consistent quality and competitive pricing, ideal for organizations with high-volume needs.",
  features: [
    "Affordable pricing",
    "Consistent print quality",
    "Fast production time",
  ],
  options: [
    "Flyers",
    "Books",
    "Forms",
  ],
  idealFor: ["Businesses", "Schools", "Organizations"],
  link: "/services/bulk-printing",
  },
  {
    id: 9,
    title: "Poster Printing",
    description:
      "Large-format posters with vibrant colors and sharp image quality.",
    icon: "image",
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    details:
    "Our poster printing service delivers eye-catching visuals with accurate color reproduction and crisp details.",
  features: [
    "High-resolution output",
    "Fade-resistant ink",
    "Large format support",
  ],
  options: [
    "A2 / A1 / Custom size",
    "Glossy / Matte",
  ],
  idealFor: ["Marketing", "Events", "Advertising"],
  link: "/services/poster-printing",
  },
  {
    id: 10,
    title: "Invoice & Receipt Books",
    description:
      "Custom invoice, receipt, and bill books with NCR paper options.",
    icon: "receipt",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    details:
    "We print professional invoice and receipt books with clear formatting and optional carbonless (NCR) paper.",
  features: [
    "Duplicate & triplicate copies",
    "Clear numbering",
    "Custom branding",
  ],
  options: [
    "NCR paper",
    "Custom size",
  ],
  idealFor: ["Shops", "Businesses"],
  link: "/services/invoice-printing",
  },
  {
    id: 12,
    title: "Sticker & Label Printing",
    description:
      "Custom stickers and labels for products, branding, and packaging.",
    icon: "sticker",
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    details:
    "We create high-quality stickers and labels that stick well and look professional for branding and packaging.",
  features: [
    "Water-resistant options",
    "Custom shapes",
    "Strong adhesive",
  ],
  options: [
    "Vinyl / Paper",
    "Glossy / Matte",
  ],
  idealFor: ["Products", "Packaging", "Branding"],
  link: "/services/sticker-printing",
  },
  {
    id: 13,
    title: "Calendar Printing",
    description:
      "Wall and desk calendars with customized designs and branding.",
    icon: "calendarDays",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10",
    link: "/services/calendar-printing",
  },
  {
    id: 17,
    title: "Lamination Services",
    description:
      "Glossy and matte lamination for documents, cards, and posters.",
    icon: "shieldCheck",
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    link: "/services/lamination",
  },
  {
    id: 18,
    title: "Cutting & Trimming",
    description:
      "Precision cutting and finishing for printed materials.",
    icon: "scissors",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-500/10",
    link: "/services/cutting-trimming",
  },
];
