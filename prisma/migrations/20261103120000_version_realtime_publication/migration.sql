-- Ensure every table used by the dashboard realtime clients is part of the
-- Supabase Realtime publication and is recorded in version control.
--
-- These tables had been added by hand in the Supabase dashboard, so fresh
-- environments (local, preview, staging) silently lost live updates even
-- though the client subscriptions still reported "SUBSCRIBED".
--
-- This migration is idempotent and safe to run on databases where some or all
-- of the tables are already published.

DO $$
DECLARE
  realtime_tables text[] := ARRAY[
    'Order',
    'User',
    'Message',
    'Conversation',
    'Designs',
    'Service',
    'Payment',
    'Expense'
  ];
  target_table text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    RAISE NOTICE 'Publication supabase_realtime does not exist; skipping.';
    RETURN;
  END IF;

  FOREACH target_table IN ARRAY realtime_tables LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = target_table
    ) THEN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime ADD TABLE %I',
        target_table
      );
    END IF;
  END LOOP;
END $$;

-- Filtered subscriptions (for example Message WHERE conversationId = ...)
-- receive INSERT/UPDATE filters from the new row, but DELETE/UPDATE filters
-- need the previous row. The default replica identity only contains the
-- primary key, so those events would never match the filter. FULL keeps the
-- whole previous row available to Realtime.
ALTER TABLE "Message" REPLICA IDENTITY FULL;
