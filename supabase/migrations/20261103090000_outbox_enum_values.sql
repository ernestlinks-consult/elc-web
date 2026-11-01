-- New enum values, alone in this file because Postgres cannot use a new value in
-- the transaction that adds it.
-- 'sending' marks a row claimed by the worker. 'resubmitted' marks answers for an
-- existing lead arriving from another session.
-- To reverse: enum values cannot be dropped; leave them, they are harmless.

alter type public.notify_status add value 'sending' after 'pending';
alter type public.lead_event_type add value 'resubmitted';
