-- Run in Supabase SQL Editor (once) so Realtime receives INSERT events on support_messages.
-- Required for the live support chat subscription in the browser.

ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
