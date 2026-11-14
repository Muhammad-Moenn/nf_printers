-- Indexes for dashboard aggregations, realtime refreshes, and paginated
-- admin/user lists. IF NOT EXISTS keeps this safe for databases where some
-- indexes were added manually.

-- Order ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx"
  ON "Order" ("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "Order_userId_orderDate_idx"
  ON "Order" ("userId", "orderDate");

CREATE INDEX IF NOT EXISTS "Order_userId_status_idx"
  ON "Order" ("userId", "status");

CREATE INDEX IF NOT EXISTS "Order_status_orderDate_idx"
  ON "Order" ("status", "orderDate");

CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx"
  ON "Order" ("status", "createdAt");

CREATE INDEX IF NOT EXISTS "Order_createdAt_idx"
  ON "Order" ("createdAt");

CREATE INDEX IF NOT EXISTS "Order_service_idx"
  ON "Order" ("service");

-- Revenue and monthly-series queries filter/group by
-- COALESCE("orderDate", "createdAt"), so a plain column index cannot serve
-- them.
CREATE INDEX IF NOT EXISTS "Order_status_effective_date_idx"
  ON "Order" ("status", (COALESCE("orderDate", "createdAt")));

CREATE INDEX IF NOT EXISTS "Order_userId_effective_date_idx"
  ON "Order" ("userId", (COALESCE("orderDate", "createdAt")));

-- Payment -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Payment_status_createdAt_idx"
  ON "Payment" ("status", "createdAt");

CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx"
  ON "Payment" ("createdAt");

-- Designs -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Designs_userId_createdAt_idx"
  ON "Designs" ("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "Designs_key_idx"
  ON "Designs" ("key");

-- Conversation --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Conversation_updatedAt_idx"
  ON "Conversation" ("updatedAt");

-- Message -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx"
  ON "Message" ("conversationId", "createdAt");

CREATE INDEX IF NOT EXISTS "Message_receiverId_seen_idx"
  ON "Message" ("receiverId", "seen");

CREATE INDEX IF NOT EXISTS "Message_createdAt_idx"
  ON "Message" ("createdAt");

-- UploadedFile --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "UploadedFile_userId_key_idx"
  ON "UploadedFile" ("userId", "key");
