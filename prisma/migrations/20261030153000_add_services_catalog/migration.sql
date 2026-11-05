-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" TEXT,
    "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "idealFor" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "icon" TEXT NOT NULL DEFAULT 'notebookPen',
    "imageUrl" TEXT,
    "pricingMethod" TEXT NOT NULL DEFAULT 'FIXED',
    "basePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minPrice" DECIMAL(12,2),
    "maxPrice" DECIMAL(12,2),
    "priceUnit" TEXT NOT NULL DEFAULT 'service',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE INDEX "Service_category_idx" ON "Service"("category");
CREATE INDEX "Service_isActive_displayOrder_idx" ON "Service"("isActive", "displayOrder");

-- Seed the existing public catalog so the admin page starts with real services.
INSERT INTO "Service" ("id", "name", "slug", "category", "description", "pricingMethod", "basePrice", "isActive", "displayOrder", "updatedAt") VALUES
('svc_register_printing', 'Register Printing', 'register-printing', 'Registers', 'School, college, and office registers printed with durable paper and clean formatting.', 'CUSTOM', 0, true, 1, CURRENT_TIMESTAMP),
('svc_book_printing', 'Book Printing', 'book-printing', 'Books', 'High-quality book printing including textbooks, novels, manuals, and magazines.', 'CUSTOM', 0, true, 2, CURRENT_TIMESTAMP),
('svc_title_cover_printing', 'Title & Cover Printing', 'title-printing', 'Books', 'Attractive book titles and covers printed with premium paper and sharp colors.', 'CUSTOM', 0, true, 3, CURRENT_TIMESTAMP),
('svc_file_document_printing', 'File & Document Printing', 'file-printing', 'Documents', 'Fast and accurate printing of files, reports, notes, and official documents.', 'CUSTOM', 0, true, 4, CURRENT_TIMESTAMP),
('svc_book_binding', 'Book Binding', 'book-binding', 'Binding', 'Spiral, soft, hard, and thermal binding for books and documents.', 'CUSTOM', 0, true, 5, CURRENT_TIMESTAMP),
('svc_bulk_printing', 'Bulk Printing', 'bulk-printing', 'Bulk', 'Cost-effective bulk printing solutions for businesses and institutions.', 'CUSTOM', 0, true, 6, CURRENT_TIMESTAMP),
('svc_poster_printing', 'Poster Printing', 'poster-printing', 'Large Format', 'Large-format posters with vibrant colors and sharp image quality.', 'CUSTOM', 0, true, 7, CURRENT_TIMESTAMP),
('svc_invoice_receipt_books', 'Invoice & Receipt Books', 'invoice-printing', 'Business Printing', 'Custom invoice, receipt, and bill books with NCR paper options.', 'CUSTOM', 0, true, 8, CURRENT_TIMESTAMP),
('svc_sticker_label_printing', 'Sticker & Label Printing', 'sticker-printing', 'Labels', 'Custom stickers and labels for products, branding, and packaging.', 'CUSTOM', 0, true, 9, CURRENT_TIMESTAMP),
('svc_calendar_printing', 'Calendar Printing', 'calendar-printing', 'Calendars', 'Wall and desk calendars with customized designs and branding.', 'CUSTOM', 0, true, 10, CURRENT_TIMESTAMP),
('svc_lamination', 'Lamination Services', 'lamination', 'Finishing', 'Glossy and matte lamination for documents, cards, and posters.', 'CUSTOM', 0, true, 11, CURRENT_TIMESTAMP),
('svc_cutting_trimming', 'Cutting & Trimming', 'cutting-trimming', 'Finishing', 'Precision cutting and finishing for printed materials.', 'CUSTOM', 0, true, 12, CURRENT_TIMESTAMP);

-- Include service changes in Supabase Realtime when the publication is available.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime'
             AND schemaname = 'public'
             AND tablename = 'Service'
       ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "Service";
    END IF;
END $$;
