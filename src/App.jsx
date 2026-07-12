import React, { useState, useEffect } from "react";
import { Trophy, Copy, ArrowRight, Plus, Users, Calendar, X, Check } from "lucide-react";

const COLORS = {
  bg: "#0B1F1C",
  surface: "#123329",
  surface2: "#1B4636",
  gold: "#D4AF37",
  goldSoft: "#E8CA6E",
  text: "#F3EFE6",
  muted: "#8FAE9E",
  line: "#2A5443",
};

const CAIRO = "'Cairo', sans-serif";
const TAJAWAL = "'Tajawal', sans-serif";

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function buildRounds(playerNames, winners) {
  let size = 1;
  while (size < playerNames.length) size *= 2;
  if (size < 2) size = 2;
  const padded = [...playerNames];
  while (padded.length < size) padded.push("BYE");
  const rounds = [padded];
  let ri = 0;
  while (rounds[rounds.length - 1].length > 1) {
    const prev = rounds[rounds.length - 1];
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const a = prev[i], b = prev[i + 1];
      const key = `r${ri}m${i / 2}`;
      let winner = null;
      if (a === "BYE" && b === "BYE") winner = "BYE";
      else if (a === "BYE") winner = b;
      else if (b === "BYE") winner = a;
      else winner = winners[key] || null;
      next.push(winner);
    }
    rounds.push(next);
    ri++;
  }
  return rounds;
}

function getStatus(t) {
  if (t.players.length < 2) {
    return t.players.length >= t.maxPlayers
      ? { label: "اكتملت التسجيلات", tone: "full" }
      : { label: "التسجيل مفتوح", tone: "open" };
  }
  const rounds = buildRounds(t.players, t.winners);
  const champion = rounds[rounds.length - 1][0];
  if (champion && champion !== "BYE") return { label: "انتهت", tone: "done" };
  if (Object.keys(t.winners).length > 0) return { label: "جارية", tone: "live" };
  if (t.players.length >= t.maxPlayers) return { label: "اكتملت التسجيلات", tone: "full" };
  return { label: "التسجيل مفتوح", tone: "open" };
}

const STATUS_STYLE = {
  open: { bg: "transparent", border: COLORS.muted, text: COLORS.muted },
  full: { bg: "transparent", border: COLORS.gold, text: COLORS.gold },
  live: { bg: COLORS.gold, border: COLORS.gold, text: COLORS.bg },
  done: { bg: COLORS.surface2, border: COLORS.line, text: COLORS.muted },
};

function roundName(ri, totalRounds) {
  const remaining = totalRounds - ri;
  if (remaining === 1) return "النهائي";
  if (remaining === 2) return "نصف النهائي";
  if (remaining === 3) return "ربع النهائي";
  return `الجولة ${ri + 1}`;
}

const seedTournaments = [
  {
    id: "t1",
    name: "بطولة الخميس الأسبوعية",
    date: "2026-07-16",
    maxPlayers: 8,
    format: "إقصاء مباشر",
    code: genCode(),
    players: ["أحمد", "سامر", "ليث", "نور", "كريم", "دانا"],
    winners: {},
  },
  {
    id: "t2",
    name: "كأس الأصدقاء",
    date: "2026-07-13",
    maxPlayers: 4,
    format: "إقصاء مباشر",
    code: genCode(),
    players: ["يوسف", "مروان", "هبة", "زيد"],
    winners: { r0m0: "يوسف" },
  },
  {
    id: "t3",
    name: "دوري الأحياء",
    date: "2026-08-02",
    maxPlayers: 16,
    format: "دوري + إقصاء",
    code: genCode(),
    players: ["رامي", "سلمى"],
    winners: {},
  },
];

function PerforatedDivider() {
  return (
    <div className="relative w-0" style={{ borderRight: `2px dashed ${COLORS.line}` }}>
      <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full" style={{ backgroundColor: COLORS.bg }} />
      <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full" style={{ backgroundColor: COLORS.bg }} />
    </div>
  );
}

function TicketCode({ code, ghost }) {
  return (
    <div
      className="px-3 py-1.5 rounded-md text-sm font-black tracking-widest"
      style={{
        backgroundColor: ghost ? "transparent" : COLORS.bg,
        border: `1px dashed ${COLORS.gold}`,
        color: COLORS.gold,
        fontFamily: CAIRO,
        opacity: ghost ? 0.5 : 1,
      }}
    >
      {code}
    </div>
  );
}

function TournamentCard({ t, onOpen }) {
  const status = getStatus(t);
  const style = STATUS_STYLE[status.tone];
  const dateLabel = new Date(t.date).toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
  return (
    <button
      onClick={onOpen}
      className="text-right rounded-xl p-5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.line}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: style.bg, border: `1px solid ${style.border}`, color: style.text, fontFamily: CAIRO }}
        >
          {status.label}
        </span>
        <span className="text-xs" style={{ color: COLORS.muted }}>{t.format}</span>
      </div>
      <h3 className="font-black text-base mb-3" style={{ fontFamily: CAIRO }}>{t.name}</h3>
      <div className="flex items-center gap-4 text-xs" style={{ color: COLORS.muted }}>
        <span className="flex items-center gap-1"><Calendar size={13} />{dateLabel}</span>
        <span className="flex items-center gap-1"><Users size={13} />{t.players.length}/{t.maxPlayers}</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, (t.players.length / t.maxPlayers) * 100)}%`, backgroundColor: COLORS.gold }}
        />
      </div>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs mb-1.5 font-bold" style={{ color: COLORS.muted, fontFamily: CAIRO }}>{label}</span>
      {children}
    </label>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("8");
  const [format, setFormat] = useState("إقصاء مباشر");

  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !date) return;
    onCreate({ name: name.trim(), date, maxPlayers, format });
  }

  const inputStyle = { border: `1px solid ${COLORS.line}`, color: COLORS.text };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg" style={{ fontFamily: CAIRO }}>إنشاء دورة جديدة</h3>
          <button onClick={onClose} className="focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"><X size={18} style={{ color: COLORS.muted }} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="اسم الدورة">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: كأس رمضان"
              className="w-full bg-transparent outline-none text-sm py-2 px-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
              style={inputStyle}
            />
          </Field>
          <Field label="تاريخ البداية">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent outline-none text-sm py-2 px-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="عدد اللاعبين">
              <select value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} className="w-full bg-transparent outline-none text-sm py-2 px-3 rounded-lg" style={inputStyle}>
                <option style={{ color: "#000" }} value="4">4</option>
                <option style={{ color: "#000" }} value="8">8</option>
                <option style={{ color: "#000" }} value="16">16</option>
              </select>
            </Field>
            <Field label="نظام الدورة">
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-transparent outline-none text-sm py-2 px-3 rounded-lg" style={inputStyle}>
                <option style={{ color: "#000" }} value="إقصاء مباشر">إقصاء مباشر</option>
                <option style={{ color: "#000" }} value="دوري + إقصاء">دوري + إقصاء</option>
              </select>
            </Field>
          </div>
          <button type="submit" className="w-full py-3 rounded-full font-black text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" style={{ backgroundColor: COLORS.gold, color: COLORS.bg, fontFamily: CAIRO }}>
            إنشاء ومشاركة رابط الدعوة
          </button>
        </form>
      </div>
    </div>
  );
}

function MatchCard({ a, b, winner, onPick }) {
  const clickable = a && b && a !== "BYE" && b !== "BYE";
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.line}` }}>
      {[a, b].map((p, idx) => {
        const isWinner = winner && p === winner;
        const label = p || "بانتظار الفائز";
        return (
          <button
            key={idx}
            disabled={!clickable || !!winner}
            onClick={() => clickable && onPick(p)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm focus:outline-none"
            style={{
              backgroundColor: isWinner ? COLORS.gold : COLORS.surface,
              color: isWinner ? COLORS.bg : p ? COLORS.text : COLORS.muted,
              borderBottom: idx === 0 ? `1px solid ${COLORS.line}` : "none",
              fontWeight: isWinner ? 800 : 500,
              cursor: clickable && !winner ? "pointer" : "default",
            }}
          >
            <span>{label}</span>
            {isWinner && <Check size={14} />}
          </button>
        );
      })}
    </div>
  );
}

function HomeScreen({ tournaments, onOpen, onCreateClick }) {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="relative rounded-2xl overflow-hidden mb-12 flex flex-col md:flex-row shadow-2xl" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
        <div className="p-8 md:p-10 flex-1">
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: COLORS.gold, fontFamily: CAIRO }}>eFOOTBALL · تنظيم الدوريات</p>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: CAIRO }}>
            خلص من فوضى البوستات..<br /> نظّم دورتك بدعوة حقيق
