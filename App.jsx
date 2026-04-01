import { useState, useRef, useEffect } from "react";

async function callAI(system, userMsg, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.map(b => b.text || "").join("") ?? "";
}

const GUIDE_PROMPT = `You are an expert world travel guide with deep knowledge of every city and country. When given a destination, provide comprehensive, research-based travel advice.

Return ONLY raw JSON starting with { and ending with }. No markdown. No explanation:
{
  "destination": "<City/Country name formatted nicely>",
  "overview": "<3 sentence exciting overview of the destination>",
  "bestTime": "<Best time to visit and why, 2 sentences>",
  "restaurants": [
    {"name": "<restaurant name>", "cuisine": "<cuisine type>", "priceRange": "£|££|£££", "description": "<2 sentence description why it's great>", "mustTry": "<specific dish to try>"}
  ],
  "mustVisit": [
    {"name": "<place name>", "type": "<Museum|Landmark|Nature|Beach|Market|etc>", "description": "<2 sentence description>", "tip": "<practical tip for visiting>"}
  ],
  "thingsToDo": [
    {"activity": "<activity name>", "category": "<Culture|Adventure|Food|Nightlife|Shopping|Relaxation>", "description": "<2 sentence description>", "cost": "Free|Low|Medium|High"}
  ],
  "avoid": [
    {"title": "<thing to avoid>", "reason": "<why and what to do instead, 2 sentences>"}
  ],
  "localTips": ["<practical tip 1>", "<practical tip 2>", "<practical tip 3>", "<practical tip 4>", "<practical tip 5>"],
  "emergencyInfo": {"police": "<local emergency number>", "ambulance": "<number>", "touristHelpline": "<if exists>"}
}

Include exactly 5 restaurants, 6 mustVisit places, 6 thingsToDo, 5 things to avoid, 5 localTips.`;

const SUPPORT_PROMPT = `You are a friendly and helpful customer support agent for TravelAI — a travel guide website that gives AI-powered travel recommendations for any city or country.

ABOUT TRAVELAI:
- Users enter any city or country and get: best restaurants, must-visit places, things to do, things to avoid, local tips
- Users can email themselves a full travel report
- The website uses AI to provide up-to-date, research-based travel advice
- Completely free to use
- Works for every country and city in the world

COMMON QUESTIONS:
- How to use: type your destination in the search box and click "Explore" or press Enter
- Email report: after getting results, click the "Email Me This Report" button and enter your email
- Accuracy: recommendations are based on extensive travel research and AI analysis
- Coverage: works for any city, town, or country worldwide
- Languages: currently in English only

Be warm, concise, helpful. Answer in 2-3 sentences. If asked about a specific destination, give a quick 1-sentence highlight.`;

const TEAL = "#0ea5e9";
const TEAL2 = "#0284c7";
const ORANGE = "#f97316";
const GREEN = "#22c55e";
const RED = "#ef4444";
const PURPLE = "#8b5cf6";

function th(dark) {
  return {
    bg: dark ? "#080f1a" : "#f0f7ff",
    card: dark ? "#0f1e2e" : "#ffffff",
    card2: dark ? "#162535" : "#e8f4ff",
    border: dark ? "#1e3448" : "#bfdbfe",
    text: dark ? "#e2f4ff" : "#0c2840",
    muted: dark ? "#5a8aaa" : "#4a7a9b",
    nav: dark ? "rgba(8,15,26,0.96)" : "rgba(240,247,255,0.96)",
  };
}

// ── API Key Screen ─────────────────────────────────────────────────────────
function KeyScreen({ onSave }) {
  const [k, setK] = useState("");
  const [e, setE] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#080f1a,#0a1f35)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#0f1e2e", border: "1px solid #1e3448", borderRadius: 24, padding: "2.5rem", boxShadow: "0 30px 80px rgba(14,165,233,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✈️</div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#e2f4ff", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>TravelAI</h1>
          <p style={{ color: "#5a8aaa", fontSize: "0.88rem" }}>Your AI-powered travel guide</p>
        </div>
        <p style={{ color: "#5a8aaa", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "1.5rem", textAlign: "center" }}>
          Enter your API key to explore any destination in the world.
          Get yours free at{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: TEAL, textDecoration: "none", fontWeight: 600 }}>console.anthropic.com</a>
        </p>
        <input type="password" placeholder="sk-ant-api03-..." value={k}
          onChange={ev => { setK(ev.target.value); setE(""); }}
          onKeyDown={ev => ev.key === "Enter" && (() => { if (!k.trim()) { setE("Please enter your API key"); return; } localStorage.setItem("tai_key", k.trim()); onSave(k.trim()); })()}
          style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 12, border: `1.5px solid ${e ? RED : "#1e3448"}`, background: "#080f1a", color: "#e2f4ff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", fontFamily: "monospace", marginBottom: "0.5rem" }} />
        {e && <p style={{ color: RED, fontSize: "0.8rem", marginBottom: "0.5rem" }}>⚠️ {e}</p>}
        <button onClick={() => { if (!k.trim()) { setE("Please enter your API key"); return; } localStorage.setItem("tai_key", k.trim()); onSave(k.trim()); }}
          style={{ width: "100%", padding: "0.85rem", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff", fontWeight: 800, fontSize: "1rem", boxShadow: "0 4px 20px rgba(14,165,233,0.4)" }}>
          Start Exploring →
        </button>
      </div>
    </div>
  );
}

// ── Section Cards ──────────────────────────────────────────────────────────
function RestaurantCard({ r, dark }) {
  const t = th(dark);
  return (
    <div style={{ padding: "1.1rem 1.25rem", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: "0.7rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: t.text }}>{r.name}</span>
          <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.55rem", borderRadius: 6, background: `${TEAL}18`, color: TEAL }}>{r.cuisine}</span>
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: ORANGE }}>{r.priceRange}</span>
      </div>
      <p style={{ fontSize: "0.85rem", color: t.muted, lineHeight: 1.6, margin: "0 0 0.4rem" }}>{r.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem" }}>
        <span style={{ color: ORANGE }}>★</span>
        <span style={{ color: t.muted }}>Must try: <strong style={{ color: t.text }}>{r.mustTry}</strong></span>
      </div>
    </div>
  );
}

function PlaceCard({ p, dark }) {
  const t = th(dark);
  const typeColors = { Museum: PURPLE, Landmark: TEAL, Nature: GREEN, Beach: ORANGE, Market: "#ec4899", default: TEAL };
  const col = typeColors[p.type] || typeColors.default;
  return (
    <div style={{ padding: "1.1rem 1.25rem", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: "0.7rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 800, fontSize: "1rem", color: t.text }}>{p.name}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "0.15rem 0.55rem", borderRadius: 6, background: `${col}18`, color: col }}>{p.type}</span>
      </div>
      <p style={{ fontSize: "0.85rem", color: t.muted, lineHeight: 1.6, margin: "0 0 0.4rem" }}>{p.description}</p>
      <div style={{ fontSize: "0.78rem", color: t.muted, padding: "0.4rem 0.7rem", borderRadius: 8, background: t.card2, display: "inline-block" }}>
        💡 {p.tip}
      </div>
    </div>
  );
}

function ActivityCard({ a, dark }) {
  const t = th(dark);
  const catColors = { Culture: PURPLE, Adventure: ORANGE, Food: RED, Nightlife: "#ec4899", Shopping: TEAL, Relaxation: GREEN };
  const col = catColors[a.category] || TEAL;
  const costColor = a.cost === "Free" ? GREEN : a.cost === "Low" ? TEAL : a.cost === "Medium" ? ORANGE : RED;
  return (
    <div style={{ padding: "1.1rem 1.25rem", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: "0.7rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: t.text }}>{a.activity}</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "0.15rem 0.55rem", borderRadius: 6, background: `${col}18`, color: col }}>{a.category}</span>
        </div>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: 6, background: `${costColor}18`, color: costColor }}>{a.cost}</span>
      </div>
      <p style={{ fontSize: "0.85rem", color: t.muted, lineHeight: 1.6, margin: 0 }}>{a.description}</p>
    </div>
  );
}

function AvoidCard({ a, dark }) {
  const t = th(dark);
  return (
    <div style={{ padding: "1.1rem 1.25rem", borderRadius: 14, background: dark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.04)", border: `1px solid ${RED}28`, marginBottom: "0.7rem", borderLeft: `3px solid ${RED}` }}>
      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: RED, marginBottom: "0.35rem" }}>⚠️ {a.title}</div>
      <p style={{ fontSize: "0.85rem", color: t.muted, lineHeight: 1.6, margin: 0 }}>{a.reason}</p>
    </div>
  );
}

// ── Support Chat ───────────────────────────────────────────────────────────
function SupportChat({ dark, apiKey, onClose }) {
  const t = th(dark);
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Hi! 👋 I'm your TravelAI assistant. Ask me anything about travel destinations or how to use the site!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  async function send() {
    const msg = input.trim();
    if (!msg) return;
    const newMsgs = [...msgs, { role: "user", text: msg }];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    try {
      const history = msgs.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
      const reply = await callAI(SUPPORT_PROMPT, `${history}\nUser: ${msg}`, apiKey);
      setMsgs(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", text: "Sorry, I'm having a technical issue. Please try again!" }]);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", width: 360, maxWidth: "calc(100vw - 2rem)", zIndex: 999, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: `1px solid ${t.border}` }}>
      <div style={{ background: `linear-gradient(135deg,${TEAL},${TEAL2})`, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>✈️</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.88rem" }}>TravelAI Support</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.7rem" }}>● Online · Instant replies</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 7, padding: "0.28rem 0.6rem", fontSize: "1rem", fontWeight: 700 }}>✕</button>
      </div>
      <div style={{ background: t.card, height: 300, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", padding: "0.6rem 0.9rem", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? `linear-gradient(135deg,${TEAL},${TEAL2})` : t.card2, color: m.role === "user" ? "#fff" : t.text, fontSize: "0.85rem", lineHeight: 1.6, border: m.role === "assistant" ? `1px solid ${t.border}` : "none" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "0.6rem 1rem", borderRadius: "14px 14px 14px 4px", background: t.card2, border: `1px solid ${t.border}` }}>
              <span style={{ display: "inline-flex", gap: "0.2rem" }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: TEAL, display: "inline-block", animation: `bounce 1.2s ${i*0.18}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ background: t.card, borderTop: `1px solid ${t.border}`, padding: "0.65rem", display: "flex", gap: "0.4rem" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about travel…"
          style={{ flex: 1, padding: "0.55rem 0.85rem", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card2, color: t.text, fontSize: "0.87rem", outline: "none", fontFamily: "inherit" }} />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ padding: "0.5rem 0.9rem", borderRadius: 9, border: "none", cursor: loading ? "not-allowed" : "pointer", background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff", fontWeight: 700, fontSize: "0.84rem", opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function TravelAI() {
  const [dark, setDark] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("tai_key") || "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guide, setGuide] = useState(null);
  const [activeTab, setActiveTab] = useState("restaurants");
  const [showSupport, setShowSupport] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const inputRef = useRef();

  if (!apiKey) return <KeyScreen onSave={setApiKey} />;

  const t = th(dark);
  const key = localStorage.getItem("tai_key") || apiKey;

  async function explore() {
    if (!query.trim()) return;
    setLoading(true); setError(""); setGuide(null); setActiveTab("restaurants"); setEmailSent(false);
    try {
      const raw = await callAI(GUIDE_PROMPT, `Give me a comprehensive travel guide for: ${query}`, key);
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Invalid response");
      setGuide(JSON.parse(raw.slice(start, end + 1)));
    } catch (e) {
      setError(e.message?.includes("401") ? "Invalid API key — click Reset Key to update it." : "Couldn't load guide. Please try again.");
    }
    setLoading(false);
  }

  async function sendEmailReport() {
    if (!emailInput.trim() || !guide) return;
    setSendingEmail(true);
    // Build plain-text report
    const report = `
TRAVELAI GUIDE: ${guide.destination}
${"=".repeat(50)}

OVERVIEW
${guide.overview}

BEST TIME TO VISIT
${guide.bestTime}

TOP RESTAURANTS
${guide.restaurants.map((r,i) => `${i+1}. ${r.name} (${r.cuisine}) ${r.priceRange}\n   ${r.description}\n   Must try: ${r.mustTry}`).join("\n\n")}

MUST VISIT PLACES
${guide.mustVisit.map((p,i) => `${i+1}. ${p.name} [${p.type}]\n   ${p.description}\n   Tip: ${p.tip}`).join("\n\n")}

THINGS TO DO
${guide.thingsToDo.map((a,i) => `${i+1}. ${a.activity} [${a.category}] - ${a.cost}\n   ${a.description}`).join("\n\n")}

WHAT TO AVOID
${guide.avoid.map((a,i) => `${i+1}. ${a.title}\n   ${a.reason}`).join("\n\n")}

LOCAL TIPS
${guide.localTips.map((tip,i) => `${i+1}. ${tip}`).join("\n")}

EMERGENCY INFO
Police: ${guide.emergencyInfo.police}
Ambulance: ${guide.emergencyInfo.ambulance}
${guide.emergencyInfo.touristHelpline ? `Tourist Helpline: ${guide.emergencyInfo.touristHelpline}` : ""}

Generated by TravelAI — travelai.vercel.app
    `.trim();

    // Use mailto as fallback since we don't have backend here
    const subject = encodeURIComponent(`TravelAI Guide: ${guide.destination}`);
    const body = encodeURIComponent(report);
    window.location.href = `mailto:${emailInput}?subject=${subject}&body=${body}`;
    setSendingEmail(false);
    setEmailSent(true);
  }

  const TABS = [
    { id: "restaurants", label: "🍽️ Restaurants", count: guide?.restaurants?.length },
    { id: "mustvisit",   label: "📍 Must Visit",   count: guide?.mustVisit?.length },
    { id: "todo",        label: "🎯 Things To Do", count: guide?.thingsToDo?.length },
    { id: "avoid",       label: "⚠️ Avoid",         count: guide?.avoid?.length },
    { id: "tips",        label: "💡 Local Tips",    count: guide?.localTips?.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Segoe UI',system-ui,sans-serif", transition: "background 0.25s" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: t.nav, backdropFilter: "blur(24px)", borderBottom: `1px solid ${t.border}`, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem" }}>
        <div style={{ fontWeight: 900, fontSize: "1.35rem", background: `linear-gradient(135deg,${TEAL},${TEAL2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.025em", cursor: "pointer" }} onClick={() => setGuide(null)}>
          ✈️ TravelAI
        </div>
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
          <button onClick={() => setShowSupport(!showSupport)} style={{ padding: "0.34rem 0.88rem", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem", background: showSupport ? `linear-gradient(135deg,${TEAL},${TEAL2})` : "transparent", color: showSupport ? "#fff" : t.muted }}>Support</button>
          <button onClick={() => setDark(!dark)} style={{ padding: "0.34rem 0.62rem", borderRadius: 8, border: "none", cursor: "pointer", background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", fontSize: "0.95rem" }}>{dark ? "☀️" : "🌙"}</button>
          <button onClick={() => { localStorage.removeItem("tai_key"); setApiKey(""); }} style={{ padding: "0.34rem 0.78rem", borderRadius: 8, border: `1px solid ${t.border}`, cursor: "pointer", background: "transparent", color: t.muted, fontSize: "0.73rem", fontWeight: 600 }}>Reset Key</button>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.25rem 5rem" }}>

        {/* HERO */}
        {!guide && !loading && (
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🌍</div>
            <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
              Explore Any Destination<br />
              <span style={{ background: `linear-gradient(135deg,${TEAL},${TEAL2},${ORANGE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Guided by AI
              </span>
            </h1>
            <p style={{ fontSize: "1.05rem", color: t.muted, maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
              Get the best restaurants, must-visit places, top activities, and honest local advice for any city or country in the world.
            </p>
          </div>
        )}

        {/* SEARCH */}
        <div style={{ marginBottom: guide ? "2rem" : "3rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", maxWidth: guide ? "100%" : 580, margin: "0 auto" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem" }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && explore()}
                placeholder="Enter city or country… e.g. Paris, Tokyo, Greece"
                style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2.8rem", borderRadius: 14, border: `1.5px solid ${t.border}`, background: t.card, color: t.text, fontSize: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit", boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(14,165,233,0.1)" }}
              />
            </div>
            <button onClick={explore} disabled={loading || !query.trim()}
              style={{ padding: "0.85rem 1.75rem", borderRadius: 14, border: "none", cursor: loading || !query.trim() ? "not-allowed" : "pointer", background: loading || !query.trim() ? "#1e3448" : `linear-gradient(135deg,${TEAL},${TEAL2})`, color: loading || !query.trim() ? t.muted : "#fff", fontWeight: 800, fontSize: "1rem", whiteSpace: "nowrap", boxShadow: loading || !query.trim() ? "none" : `0 4px 20px ${TEAL}45` }}>
              {loading ? "Loading…" : "Explore →"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 1.5s ease-in-out infinite" }}>✈️</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: t.text, marginBottom: "0.5rem" }}>Researching {query}…</h2>
            <p style={{ color: t.muted, fontSize: "0.95rem" }}>Finding the best restaurants, hidden gems and local secrets</p>
          </div>
        )}

        {/* Error */}
        {error && <div style={{ padding: "1rem 1.25rem", borderRadius: 14, background: `${RED}12`, border: `1px solid ${RED}35`, color: RED, marginBottom: "1rem" }}>⚠️ {error}</div>}

        {/* GUIDE RESULTS */}
        {guide && (
          <>
            {/* Destination header */}
            <div style={{ padding: "1.5rem 1.75rem", borderRadius: 20, background: `linear-gradient(135deg,${dark ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.08)"},${dark ? "rgba(2,132,199,0.08)" : "rgba(2,132,199,0.04)"})`, border: `1px solid ${TEAL}30`, marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.5rem", color: t.text }}>{guide.destination}</h2>
                  <p style={{ color: t.muted, fontSize: "0.92rem", lineHeight: 1.65, maxWidth: 560, margin: 0 }}>{guide.overview}</p>
                </div>
                <div style={{ padding: "0.75rem 1rem", borderRadius: 12, background: t.card, border: `1px solid ${t.border}`, minWidth: 180 }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>Best Time to Visit</div>
                  <div style={{ fontSize: "0.85rem", color: t.muted, lineHeight: 1.5 }}>{guide.bestTime}</div>
                </div>
              </div>
            </div>

            {/* Email Report */}
            <div style={{ padding: "1rem 1.25rem", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "1rem" }}>📧</span>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: t.text, flex: 1, minWidth: 140 }}>Get this guide in your inbox</span>
              <input value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendEmailReport()} placeholder="your@email.com"
                style={{ padding: "0.5rem 0.85rem", borderRadius: 9, border: `1px solid ${t.border}`, background: t.card2, color: t.text, fontSize: "0.87rem", outline: "none", fontFamily: "inherit", width: 200 }} />
              <button onClick={sendEmailReport} disabled={sendingEmail || !emailInput.trim() || emailSent}
                style={{ padding: "0.5rem 1.1rem", borderRadius: 9, border: "none", cursor: emailSent ? "default" : "pointer", background: emailSent ? `${GREEN}20` : `linear-gradient(135deg,${TEAL},${TEAL2})`, color: emailSent ? GREEN : "#fff", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                {emailSent ? "✓ Opened!" : sendingEmail ? "…" : "Send Report"}
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding: "0.5rem 1rem", borderRadius: 10, border: `1.5px solid ${activeTab === tab.id ? TEAL : t.border}`, cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", background: activeTab === tab.id ? (dark ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.08)") : t.card, color: activeTab === tab.id ? TEAL : t.muted, whiteSpace: "nowrap", transition: "all 0.15s" }}>
                  {tab.label} {tab.count && <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>({tab.count})</span>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "restaurants" && guide.restaurants.map((r, i) => <RestaurantCard key={i} r={r} dark={dark} />)}
            {activeTab === "mustvisit"   && guide.mustVisit.map((p, i)    => <PlaceCard key={i} p={p} dark={dark} />)}
            {activeTab === "todo"        && guide.thingsToDo.map((a, i)   => <ActivityCard key={i} a={a} dark={dark} />)}
            {activeTab === "avoid"       && guide.avoid.map((a, i)        => <AvoidCard key={i} a={a} dark={dark} />)}
            {activeTab === "tips" && (
              <div>
                {guide.localTips.map((tip, i) => (
                  <div key={i} style={{ padding: "1rem 1.25rem", borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: "0.65rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${TEAL}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: TEAL, fontWeight: 900, fontSize: "0.85rem" }}>{i + 1}</div>
                    <span style={{ fontSize: "0.92rem", color: t.text, lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
                {/* Emergency Info */}
                <div style={{ padding: "1rem 1.25rem", borderRadius: 14, background: dark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.04)", border: `1px solid ${RED}28`, marginTop: "1rem" }}>
                  <div style={{ fontWeight: 700, color: RED, marginBottom: "0.65rem", fontSize: "0.9rem" }}>🚨 Emergency Numbers</div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {[["Police", guide.emergencyInfo.police], ["Ambulance", guide.emergencyInfo.ambulance], guide.emergencyInfo.touristHelpline && ["Tourist Help", guide.emergencyInfo.touristHelpline]].filter(Boolean).map(([label, num]) => (
                      <div key={label} style={{ padding: "0.5rem 0.9rem", borderRadius: 8, background: t.card, border: `1px solid ${t.border}` }}>
                        <div style={{ fontSize: "0.68rem", color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: RED }}>{num}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* POPULAR DESTINATIONS */}
        {!guide && !loading && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Popular Destinations</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              {["🗼 Paris", "🗾 Tokyo", "🏛️ Rome", "🌴 Bali", "🗽 New York", "🏖️ Dubai", "🏰 London", "🌊 Barcelona", "🌿 Costa Rica", "🏔️ Switzerland"].map(dest => (
                <button key={dest} onClick={() => { setQuery(dest.split(" ").slice(1).join(" ")); setTimeout(explore, 50); }}
                  style={{ padding: "0.5rem 1rem", borderRadius: 999, border: `1px solid ${t.border}`, cursor: "pointer", background: t.card, color: t.muted, fontSize: "0.85rem", fontWeight: 600, transition: "all 0.15s" }}>
                  {dest}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Support */}
      {showSupport && <SupportChat dark={dark} apiKey={key} onClose={() => setShowSupport(false)} />}
      {!showSupport && (
        <button onClick={() => setShowSupport(true)} style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", width: 54, height: 54, borderRadius: "50%", border: "none", cursor: "pointer", background: `linear-gradient(135deg,${TEAL},${TEAL2})`, color: "#fff", fontSize: "1.3rem", boxShadow: `0 6px 24px ${TEAL}50`, zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          💬
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #5a8aaa; }
      `}</style>
    </div>
  );
}
