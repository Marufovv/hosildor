# Hosilink
Next-compatible React/TypeScript application on Sites Vinext. Modules: catalogue, checkout, farmer supply, receiving, reservations, delivery, settlements, expenses, returns and audit.

This owner-private review deployment uses Sites authentication and D1 instead of the proposed PostgreSQL/SMS production stack. Every workspace is partitioned by the authenticated Sites user ID. Role switching explicitly simulates roles inside the owner's workspace, not authentication as another person.

One D1 row stores a versioned workspace aggregate. Each action computes a new state and a conditional UPDATE by owner and previous version atomically commits inventory, ledger, audit and idempotency keys. Concurrent changes conflict and refresh. Integer UZS and grams, price snapshots, distinct supply commitments and inventory lots. Append-only ledger with reversal entries and closed-period guards.

Production SMS authentication, independent staff memberships, PostgreSQL/RLS migration, VAT policy, uploads, Telegram, payments, GPS, automated backup restoration and official documents remain integrations. All demo data is labelled.
