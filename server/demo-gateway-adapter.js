"use strict";

const http = require("http");
const { randomUUID } = require("crypto");
const { WebSocketServer } = require("ws");

const ADAPTER_PORT = parseInt(process.env.DEMO_ADAPTER_PORT || "18789", 10);
const MAIN_KEY = "main";
const MODELS = [{ id: "demo/mock-office", name: "Mock Office", provider: "demo" }];

const agents = new Map([
  [
    "everflow-supervisor",
    {
      id: "everflow-supervisor",
      name: "0. The Supervisor (Router)",
      role: "Orchestration • Webhook Triage & LangGraph Router",
      workspace: "/everflow/supervisor",
    },
  ],
  [
    "everflow-cx",
    {
      id: "everflow-cx",
      name: "1. CX Chatbot",
      role: "Front-Office • Shopee/Lazada/TikTok/Shopify CX",
      workspace: "/everflow/cx-chatbot",
    },
  ],
  [
    "everflow-inventory",
    {
      id: "everflow-inventory",
      name: "2. Inventory Controller",
      role: "Mid-Office • 4-Platform Stock Sync & 3PL CBM",
      workspace: "/everflow/inventory-controller",
    },
  ],
  [
    "everflow-sourcing",
    {
      id: "everflow-sourcing",
      name: "3. Sourcing & Margin Analyst",
      role: "Back-Office • 1688 Landed Cost & 9% GST Analyst",
      workspace: "/everflow/sourcing-analyst",
    },
  ],
  [
    "everflow-marketing",
    {
      id: "everflow-marketing",
      name: "4. Marketing Creative",
      role: "Front-Office • Listing Copy & ComfyUI (#00357a)",
      workspace: "/everflow/marketing-creative",
    },
  ],
  [
    "everflow-social",
    {
      id: "everflow-social",
      name: "5. Social Media Specialist",
      role: "Front-Office • Daily Social Posts, Photo HITL & Gemini Argon",
      workspace: "/everflow/social-media",
    },
  ],
]);

const files = new Map();
const demoTasks = new Map([
  [
    "task-1",
    {
      id: "task-1",
      title: "Triage incoming Shopee/Lazada/TikTok/Shopify webhooks via LangGraph",
      description:
        "Ingest omnichannel JSON payloads, filter API noise, and route strictly to route_to_cx, route_to_inventory, route_to_sourcing, or route_to_marketing.",
      status: "working",
      source: "hermes_event",
      assignedAgentId: "everflow-supervisor",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      channel: "n8n",
      notes: ["Phase 2 Pydantic SupervisorRouteSchema & prompt injection guards active."],
      archived: false,
    },
  ],
  [
    "task-2",
    {
      id: "task-2",
      title: "Answer omnichannel FAQs: Polymailer sizing & A6 Thermal Label compatibility",
      description:
        "Reply to Shopee/Lazada/TikTok/Shopify buyers on 60-micron polymailer sizes (17x29 to 40x55cm) and Zebra/HPRT/Xprinter A6 waybill compatibility.",
      status: "working",
      source: "playbook",
      assignedAgentId: "everflow-cx",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 1200000).toISOString(),
      channel: "shopee",
      notes: ["Auto-escalates refund claims > $50 SGD to Telegram HITL."],
      archived: false,
    },
  ],
  [
    "task-3",
    {
      id: "task-3",
      title: "Monitor 4-platform stock & forecast 3PL CBM capacity (Locad/uParcel)",
      description:
        "Check safety thresholds for White Polymailers (25x35cm), Kraft Bubble Mailers (#0), and OPP Tape; alert Telegram when stock drops below threshold.",
      status: "scheduled",
      source: "hermes_event",
      assignedAgentId: "everflow-inventory",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      channel: "shopify",
      notes: ["SKU bubble_mailer_kraft_#0 flagged at 180 pcs (0.144 CBM restock needed)."],
      archived: false,
    },
  ],
  [
    "task-4",
    {
      id: "task-4",
      title: "Approve 1688 White Polymailer 25x35cm Landed Cost Model (Telegram HITL)",
      description:
        "Factory ¥0.16 RMB -> Landed $0.0609 SGD/pc (incl. Sea Freight + 9% SG GST) -> 39.4% Shopee Net Margin. Awaiting Telegram HITL approval.",
      status: "needs_attention",
      source: "hermes_event",
      assignedAgentId: "everflow-sourcing",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 600000).toISOString(),
      channel: "telegram",
      notes: ["Connected to @Everflow_Supplies_Bot for 1-tap Approve/Reject."],
      archived: false,
    },
  ],
  [
    "task-5",
    {
      id: "task-5",
      title: "Generate ComfyUI ad banner & Shopee listing copy (#00357a Navy & Montserrat)",
      description:
        "Create high-converting listing copy and ComfyUI banner prompts strictly formatted to Everflow brand guidelines (Dark Navy #00357a, White #ffffff, Montserrat).",
      status: "done",
      source: "hermes3d_manual",
      assignedAgentId: "everflow-marketing",
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      channel: "tiktok",
      notes: ["Brand compliance check passed (100% Golden Eval Suite)."],
      archived: false,
    },
  ],
  [
    "task-6",
    {
      id: "task-6",
      title: "Draft daily packaging demo post & dispatch photo to Telegram for Alvin's approval",
      description:
        "Generate daily social media creative, send photo to Telegram (@Everflow_Supplies_Bot), capture comments for Gemini Argon revisions, and queue approved posts.",
      status: "working",
      source: "hermes_event",
      assignedAgentId: "everflow-social",
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      channel: "telegram",
      notes: ["Telegram Photo HITL Gate & Gemini Argon revision engine active."],
      archived: false,
    },
  ],
]);
const sessionSettings = new Map();
const conversationHistory = new Map();
const activeRuns = new Map();
const activeSendEventFns = new Set();

function randomId() {
  return randomUUID().replace(/-/g, "");
}

function sessionKeyFor(agentId) {
  return `agent:${agentId}:${MAIN_KEY}`;
}

function getHistory(sessionKey) {
  if (!conversationHistory.has(sessionKey)) {
    conversationHistory.set(sessionKey, []);
  }
  return conversationHistory.get(sessionKey);
}

function clearHistory(sessionKey) {
  conversationHistory.delete(sessionKey);
}

function resOk(id, payload) {
  return { type: "res", id, ok: true, payload: payload ?? {} };
}

function resErr(id, code, message) {
  return { type: "res", id, ok: false, error: { code, message } };
}

function broadcastEvent(frame) {
  for (const send of activeSendEventFns) {
    try {
      send(frame);
    } catch {}
  }
}

function agentListPayload() {
  return [...agents.values()].map((agent) => ({
    id: agent.id,
    name: agent.name,
    workspace: agent.workspace,
    identity: { name: agent.name, emoji: "🤖" },
    role: agent.role,
  }));
}

function buildDemoReply(agent, message) {
  const normalized = message.trim();
  const compactMessage = normalized.replace(/\s+/g, " ").trim();
  if (agent.id === "everflow-supervisor") {
    return `[Agent 0 • The Supervisor] Ingested: "${compactMessage}". Analyzing payload intent and routing to specialist Minion desks: CX, Inventory, Sourcing, Marketing, or Social Media.`;
  }
  if (agent.id === "everflow-cx") {
    return `[Agent 1 • CX Chatbot] Omnichannel desk ready (Shopee, Lazada, TikTok Shop, Shopify). For "${compactMessage}": 60-micron polymailers and A6 thermal labels are fully stocked!`;
  }
  if (agent.id === "everflow-inventory") {
    return `[Agent 2 • Inventory Controller] Stock synced across 4 platforms. Forecasting 3PL CBM capacity with Locad/uParcel for: "${compactMessage}".`;
  }
  if (agent.id === "everflow-sourcing") {
    return `[Agent 3 • Sourcing Analyst] Calculating 1688 landed cost unit economics: (Factory RMB ÷ 5.20) + CBM Sea Freight + 9% SG GST. Will request Telegram approval before supplier outreach!`;
  }
  if (agent.id === "everflow-marketing") {
    return `[Agent 4 • Marketing Creative] Generating high-converting listing copy and ComfyUI ad banner prompts (#00357a Navy & Montserrat) for: "${compactMessage}".`;
  }
  if (agent.id === "everflow-social") {
    return `[Agent 5 • Social Media Specialist] Mel here! Generating daily social media content for: "${compactMessage}". Sending creative photo to @Everflow_Supplies_Bot on Telegram for Alvin's approval, with Gemini Argon on low complex for instant revisions!`;
  }
  return `${agent.name} checking in from ${agent.role}. Focus: ${compactMessage}.`;
}

async function handleMethod(method, params, id, sendEvent) {
  const p = params || {};

  switch (method) {
    case "agents.list":
      return resOk(id, { defaultId: "everflow-supervisor", mainKey: MAIN_KEY, agents: agentListPayload() });

    case "agents.create": {
      const name = typeof p.name === "string" && p.name.trim() ? p.name.trim() : "Demo Agent";
      const role = typeof p.role === "string" ? p.role.trim() : "";
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "demo-agent";
      const agentId = `${slug}-${randomId().slice(0, 6)}`;
      agents.set(agentId, {
        id: agentId,
        name,
        role,
        workspace: `/demo/${slug}`,
      });
      broadcastEvent({
        type: "event",
        event: "presence",
        payload: { sessions: { recent: [], byAgent: [] } },
      });
      return resOk(id, { agentId, name, workspace: `/demo/${slug}` });
    }

    case "agents.update": {
      const agentId = typeof p.agentId === "string" ? p.agentId.trim() : "";
      const agent = agents.get(agentId);
      if (!agent) return resErr(id, "not_found", `Agent ${agentId} not found`);
      if (typeof p.name === "string" && p.name.trim()) agent.name = p.name.trim();
      if (typeof p.role === "string") agent.role = p.role.trim();
      return resOk(id, { ok: true, removedBindings: 0 });
    }

    case "agents.delete": {
      const agentId = typeof p.agentId === "string" ? p.agentId.trim() : "";
      if (agentId && agents.has(agentId) && agentId !== "everflow-supervisor") {
        agents.delete(agentId);
        clearHistory(sessionKeyFor(agentId));
      }
      return resOk(id, { ok: true, removedBindings: 0 });
    }

    case "agents.files.get": {
      const key = `${p.agentId || "everflow-supervisor"}/${p.name || ""}`;
      const content = files.get(key);
      return resOk(id, { file: content !== undefined ? { content } : { missing: true } });
    }

    case "agents.files.set": {
      const key = `${p.agentId || "everflow-supervisor"}/${p.name || ""}`;
      files.set(key, typeof p.content === "string" ? p.content : "");
      return resOk(id, {});
    }

    case "config.get":
      return resOk(id, {
        config: { gateway: { reload: { mode: "hot" } } },
        hash: "demo-gateway",
        exists: true,
        path: "/demo/config.json",
      });

    case "config.patch":
    case "config.set":
      return resOk(id, { hash: "demo-gateway" });

    case "exec.approvals.get":
      return resOk(id, {
        path: "",
        exists: true,
        hash: "demo-approvals",
        file: { version: 1, defaults: { security: "full", ask: "off", autoAllowSkills: true }, agents: {} },
      });

    case "exec.approvals.set":
      return resOk(id, { hash: "demo-approvals" });

    case "exec.approval.resolve":
      return resOk(id, { ok: true });

    case "models.list":
      return resOk(id, { models: MODELS });

    case "skills.status":
      return resOk(id, {
        workspaceDir: "/demo/workspace",
        managedSkillsDir: "/demo/skills",
        skills: [
          {
            name: "task-manager",
            skillKey: "task-manager",
            description: "Maintain a shared workspace TODO list and kanban task board.",
            source: "hermes-workspace",
            bundled: true,
            filePath: "/demo/skills/task-manager/SKILL.md",
            baseDir: "/demo/skills/task-manager",
            always: true,
            disabled: false,
            blockedByAllowlist: false,
            eligible: true,
            requirements: { bins: [], anyBins: [], env: [], config: [], os: [] },
            missing: { bins: [], anyBins: [], env: [], config: [], os: [] },
            configChecks: [],
            install: [],
          },
        ],
      });

    case "skills.install":
    case "skills.update":
    case "skills.bins.install":
      return resOk(id, { ok: true, name: "task-manager" });

    case "tasks.list": {
      const includeArchived = Boolean(p.includeArchived);
      const list = [...demoTasks.values()].filter(
        (t) => includeArchived || !t.archived,
      );
      return resOk(id, { tasks: list });
    }

    case "tasks.create": {
      const taskId = "task-" + randomId().slice(0, 8);
      const now = new Date().toISOString();
      const newTask = {
        id: taskId,
        title: p.title || "Untitled task",
        description: p.description || "",
        status: p.status || "inbox",
        source: p.source || "hermes3d_manual",
        assignedAgentId: p.assignedAgentId || null,
        createdAt: now,
        updatedAt: now,
        channel: p.channel || "office",
        notes: Array.isArray(p.notes) ? p.notes : [],
        archived: false,
      };
      demoTasks.set(taskId, newTask);
      return resOk(id, newTask);
    }

    case "tasks.update": {
      const taskId = p.id;
      const existing = demoTasks.get(taskId) || {
        id: taskId,
        title: p.title || "Task",
        status: "inbox",
        createdAt: new Date().toISOString(),
      };
      const updated = {
        ...existing,
        ...p,
        updatedAt: new Date().toISOString(),
      };
      demoTasks.set(taskId, updated);
      return resOk(id, updated);
    }

    case "tasks.delete": {
      const taskId = p.id;
      demoTasks.delete(taskId);
      return resOk(id, { ok: true, removed: true });
    }

    case "cron.list":
      return resOk(id, { jobs: [] });

    case "cron.add":
    case "cron.run":
    case "cron.remove":
      return resErr(id, "unsupported_method", `Demo runtime does not support ${method}.`);

    case "sessions.list": {
      const sessions = [...agents.values()].map((agent) => {
        const sessionKey = sessionKeyFor(agent.id);
        const history = getHistory(sessionKey);
        const settings = sessionSettings.get(sessionKey) || {};
        return {
          key: sessionKey,
          agentId: agent.id,
          updatedAt: history.length > 0 ? Date.now() : null,
          displayName: "Main",
          origin: { label: agent.name, provider: "demo" },
          model: settings.model || MODELS[0].id,
          modelProvider: "demo",
        };
      });
      return resOk(id, { sessions });
    }

    case "sessions.preview": {
      const keys = Array.isArray(p.keys) ? p.keys : [];
      const limit = typeof p.limit === "number" ? p.limit : 8;
      const maxChars = typeof p.maxChars === "number" ? p.maxChars : 240;
      const previews = keys.map((key) => {
        const history = getHistory(key);
        if (history.length === 0) return { key, status: "empty", items: [] };
        const items = history.slice(-limit).map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          text: String(msg.content || "").slice(0, maxChars),
          timestamp: Date.now(),
        }));
        return { key, status: "ok", items };
      });
      return resOk(id, { ts: Date.now(), previews });
    }

    case "sessions.patch": {
      const key = typeof p.key === "string" ? p.key : sessionKeyFor("everflow-supervisor");
      const current = sessionSettings.get(key) || {};
      const next = { ...current };
      if (p.model !== undefined) next.model = p.model;
      if (p.thinkingLevel !== undefined) next.thinkingLevel = p.thinkingLevel;
      sessionSettings.set(key, next);
      return resOk(id, {
        ok: true,
        key,
        entry: { thinkingLevel: next.thinkingLevel },
        resolved: { model: next.model || MODELS[0].id, modelProvider: "demo" },
      });
    }

    case "sessions.reset": {
      const key = typeof p.key === "string" ? p.key : sessionKeyFor("everflow-supervisor");
      clearHistory(key);
      return resOk(id, { ok: true });
    }

    case "chat.send": {
      const sessionKey = typeof p.sessionKey === "string" ? p.sessionKey : sessionKeyFor("everflow-supervisor");
      const agentId = sessionKey.startsWith("agent:") ? sessionKey.split(":")[1] : "everflow-supervisor";
      const agent = agents.get(agentId) || agents.get("everflow-supervisor");
      const message = typeof p.message === "string" ? p.message.trim() : String(p.message || "").trim();
      const runId = typeof p.idempotencyKey === "string" && p.idempotencyKey ? p.idempotencyKey : randomId();
      if (!message) return resOk(id, { status: "no-op", runId });

      const reply = buildDemoReply(agent, message);
      let aborted = false;
      activeRuns.set(runId, {
        runId,
        sessionKey,
        agentId,
        abort() {
          aborted = true;
        },
      });

      setImmediate(async () => {
        let seq = 0;
        const emitChat = (state, extra) => {
          sendEvent({
            type: "event",
            event: "chat",
            seq: seq++,
            payload: { runId, sessionKey, state, ...extra },
          });
        };

        try {
          const words = reply.split(" ");
          let partial = "";
          for (const word of words) {
            if (aborted) break;
            partial = partial ? `${partial} ${word}` : word;
            emitChat("delta", { message: { role: "assistant", content: partial } });
            await new Promise((resolve) => setTimeout(resolve, 45));
          }

          if (aborted) {
            emitChat("aborted", {});
            return;
          }

          const history = getHistory(sessionKey);
          history.push({ role: "user", content: message });
          history.push({ role: "assistant", content: reply });
          emitChat("final", { stopReason: "end_turn", message: { role: "assistant", content: reply } });
          sendEvent({
            type: "event",
            event: "presence",
            seq: seq++,
            payload: {
              sessions: {
                recent: [{ key: sessionKey, updatedAt: Date.now() }],
                byAgent: [{ agentId, recent: [{ key: sessionKey, updatedAt: Date.now() }] }],
              },
            },
          });
        } finally {
          activeRuns.delete(runId);
        }
      });

      return resOk(id, { status: "started", runId });
    }

    case "chat.abort": {
      const runId = typeof p.runId === "string" ? p.runId.trim() : "";
      const sessionKey = typeof p.sessionKey === "string" ? p.sessionKey.trim() : "";
      let aborted = 0;
      if (runId) {
        const handle = activeRuns.get(runId);
        if (handle) {
          handle.abort();
          activeRuns.delete(runId);
          aborted += 1;
        }
      } else if (sessionKey) {
        for (const [activeRunId, handle] of activeRuns.entries()) {
          if (handle.sessionKey !== sessionKey) continue;
          handle.abort();
          activeRuns.delete(activeRunId);
          aborted += 1;
        }
      }
      return resOk(id, { ok: true, aborted });
    }

    case "chat.history": {
      const sessionKey = typeof p.sessionKey === "string" ? p.sessionKey : sessionKeyFor("everflow-supervisor");
      return resOk(id, { sessionKey, messages: getHistory(sessionKey) });
    }

    case "agent.wait": {
      const runId = typeof p.runId === "string" ? p.runId : "";
      const timeoutMs = typeof p.timeoutMs === "number" ? p.timeoutMs : 30000;
      const start = Date.now();
      while (activeRuns.has(runId) && Date.now() - start < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return resOk(id, { status: activeRuns.has(runId) ? "running" : "done" });
    }

    case "status": {
      const recent = [...agents.keys()].flatMap((agentId) => {
        const key = sessionKeyFor(agentId);
        const history = getHistory(key);
        return history.length > 0 ? [{ key, updatedAt: Date.now() }] : [];
      });
      return resOk(id, {
        sessions: {
          recent,
          byAgent: [...agents.keys()].map((agentId) => ({
            agentId,
            recent: recent.filter((entry) => entry.key.includes(`:${agentId}:`)),
          })),
        },
      });
    }

    case "wake":
      return resOk(id, { ok: true });

    default:
      return resOk(id, {});
  }
}

function startAdapter() {
  const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hermes3D Demo Gateway Adapter\n");
  });

  const wss = new WebSocketServer({ server: httpServer });
  wss.on("connection", (ws) => {
    let connected = false;
    let globalSeq = 0;

    const send = (frame) => {
      if (ws.readyState !== ws.OPEN) return;
      ws.send(JSON.stringify(frame));
    };

    const sendEventFn = (frame) => {
      if (frame.type === "event" && typeof frame.seq !== "number") {
        frame.seq = globalSeq++;
      }
      send(frame);
    };

    activeSendEventFns.add(sendEventFn);
    send({ type: "event", event: "connect.challenge", payload: { nonce: randomId() } });

    ws.on("message", async (raw) => {
      let frame;
      try {
        frame = JSON.parse(raw.toString("utf8"));
      } catch {
        return;
      }
      if (!frame || typeof frame !== "object" || frame.type !== "req") return;
      const { id, method, params } = frame;
      if (typeof id !== "string" || typeof method !== "string") return;

      if (method === "connect") {
        connected = true;
        send({
          type: "res",
          id,
          ok: true,
          payload: {
            type: "hello-ok",
            protocol: 3,
            adapterType: "demo",
            features: {
              methods: [
                "agents.list",
                "agents.create",
                "agents.delete",
                "agents.update",
                "sessions.list",
                "sessions.preview",
                "sessions.patch",
                "sessions.reset",
                "chat.send",
                "chat.abort",
                "chat.history",
                "agent.wait",
                "status",
                "config.get",
                "config.set",
                "config.patch",
                "agents.files.get",
                "agents.files.set",
                "exec.approvals.get",
                "exec.approvals.set",
                "exec.approval.resolve",
                "wake",
                "skills.status",
                "models.list",
                "cron.list",
              ],
              events: ["chat", "presence", "heartbeat"],
            },
            snapshot: {
              health: {
                agents: [...agents.values()].map((agent) => ({
                  agentId: agent.id,
                  name: agent.name,
                  isDefault: agent.id === "everflow-supervisor",
                })),
                defaultAgentId: "everflow-supervisor",
              },
              sessionDefaults: { mainKey: MAIN_KEY },
            },
            auth: { role: "operator", scopes: ["operator.admin"] },
            policy: { tickIntervalMs: 30000 },
          },
        });
        return;
      }

      if (!connected) {
        send(resErr(id, "not_connected", "Send connect first."));
        return;
      }

      try {
        send(await handleMethod(method, params, id, sendEventFn));
      } catch (error) {
        send(resErr(id, "internal_error", error instanceof Error ? error.message : "Internal error"));
      }
    });

    ws.on("close", () => activeSendEventFns.delete(sendEventFn));
    ws.on("error", () => activeSendEventFns.delete(sendEventFn));
  });

  httpServer.listen(ADAPTER_PORT, "127.0.0.1", () => {
    console.log(`[demo-gateway] Listening on ws://localhost:${ADAPTER_PORT}`);
    console.log("[demo-gateway] No Hermes or Hermes required.");
  });
}

if (require.main === module) {
  startAdapter();
}

module.exports = {
  handleMethod,
  startAdapter,
};
