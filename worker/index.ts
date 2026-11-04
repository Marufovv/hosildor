import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { transition } from "../app/domain";

const worker = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
  async scheduled(_event: ScheduledEvent, env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(runDailyRadar(env.DB));
  },
};

export default worker;

async function runDailyRadar(db?: D1Database) {
  if (!db) return;
  const result = await db.prepare(
    "SELECT owner_id, version, body FROM workspaces",
  ).all<{ owner_id: string; version: number; body: string }>();

  for (const row of result.results ?? []) {
    try {
      const state = JSON.parse(row.body);
      const next = transition(
        state,
        "radarRefresh",
        { keepResolved: true },
        "admin",
        `radar-${new Date().toISOString().slice(0, 10)}`,
      );
      await db.prepare(
        "UPDATE workspaces SET body = ?, version = version + 1, updated_at = ? WHERE owner_id = ? AND version = ?",
      ).bind(JSON.stringify(next), new Date().toISOString(), row.owner_id, row.version).run();
    } catch (error) {
      console.error("Hosil Radar calculation failed", row.owner_id, error);
    }
  }
}
