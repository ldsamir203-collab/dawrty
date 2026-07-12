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
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: COLORS.gold, fontFamily: CAIRO }}>eFOOTBALL tournaments</p>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: CAIRO }}>
            خلص من فوضى البوستات.. نظّم دورتك بدعوة حقيقية
          </h1>
          <p className="text-sm md:text-base mb-6 max-w-md" style={{ color: COLORS.muted }}>
            بدل ما تعتمد على بوست تايه بين المنشورات، أنشئ دورة إيفوتبول برابط دعوة واحد، تسجيل مباشر، وجدول مباريات بيتحدث لحاله.
          </p>
          <button onClick={onCreateClick} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" style={{ backgroundColor: COLORS.gold, color: COLORS.bg, fontFamily: CAIRO }}>
            <Plus size={18} /> إنشاء دورة جديدة
          </button>
        </div>
        <div className="hidden md:flex relative">
          <PerforatedDivider />
          <div className="w-48 flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: COLORS.surface2 }}>
            <span className="text-xs font-bold mb-2" style={{ color: COLORS.muted, fontFamily: CAIRO }}>دعوتك جاهزة</span>
            <TicketCode code="XXXXXX" ghost />
            <span className="text-xs mt-3" style={{ color: COLORS.muted }}>رابط واحد لكل اللاعبين</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black" style={{ fontFamily: CAIRO }}>الدورات الحالية</h2>
        <span className="text-xs" style={{ color: COLORS.muted }}>{tournaments.length} دورة</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} t={t} onOpen={() => onOpen(t.id)} />
        ))}
      </div>
    </main>
  );
}

function DetailScreen({ tournament, onJoin, onSetWinner, onCopyInvite }) {
  const [name, setName] = useState("");
  const t = tournament;
  const full = t.players.length >= t.maxPlayers;
  const rounds = t.players.length >= 2 ? buildRounds(t.players, t.winners) : null;

  function submitJoin(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin(name.trim());
    setName("");
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black mb-1" style={{ fontFamily: CAIRO }}>{t.name}</h1>
      <p className="text-sm mb-8" style={{ color: COLORS.muted }}>{t.format} · {t.players.length}/{t.maxPlayers} لاعب</p>

      <div className="relative rounded-2xl overflow-hidden mb-10 flex flex-col sm:flex-row" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
        <div className="p-6 flex-1">
          <p className="text-xs font-bold mb-1" style={{ color: COLORS.gold, fontFamily: CAIRO }}>دعوة الدورة</p>
          <p className="text-sm mb-4" style={{ color: COLORS.muted }}>شارك هالرابط مع كل اللاعبين، بيسجلوا بضغطة وحدة بدل ما تنشره كبوست عشوائي.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono px-3 py-2 rounded-lg" style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
              dawrty.app/join/{t.code}
            </span>
            <button onClick={onCopyInvite} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" style={{ backgroundColor: COLORS.gold, color: COLORS.bg, fontFamily: CAIRO }}>
              <Copy size={14} /> نسخ
            </button>
          </div>
        </div>
        <div className="hidden sm:flex">
          <PerforatedDivider />
          <div className="w-40 flex items-center justify-center px-4" style={{ backgroundColor: COLORS.surface2 }}>
            <TicketCode code={t.code} />
          </div>
        </div>
      </div>

      {!full ? (
        <form onSubmit={submitJoin} className="flex gap-3 mb-10">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك أو اسم فريقك"
            className="flex-1 bg-transparent outline-none text-sm py-3 px-4 rounded-full focus:ring-2 focus:ring-yellow-400"
            style={{ border: `1px solid ${COLORS.line}`, color: COLORS.text }}
          />
          <button type="submit" className="px-6 py-3 rounded-full font-black text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" style={{ backgroundColor: COLORS.gold, color: COLORS.bg, fontFamily: CAIRO }}>
            انضم للدورة
          </button>
        </form>
      ) : (
        <p className="mb-10 text-sm font-bold" style={{ color: COLORS.gold, fontFamily: CAIRO }}>اكتمل العدد، التسجيل مقفول</p>
      )}

      <div className="mb-12">
        <h2 className="font-black text-base mb-4" style={{ fontFamily: CAIRO }}>اللاعبون المسجّلون</h2>
        {t.players.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.muted }}>لسا ما في حدا سجل. شارك رابط الدعوة!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {t.players.map((p, i) => (
              <span key={i} className="text-sm px-3 py-1.5 rounded-full" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.line}` }}>{p}</span>
            ))}
          </div>
        )}
      </div>

      {rounds && (
        <div>
          <h2 className="font-black text-base mb-5" style={{ fontFamily: CAIRO }}>جدول المباريات</h2>
          <div className="flex gap-8 overflow-x-auto pb-4">
            {rounds.slice(0, -1).map((roundPlayers, ri) => (
              <div key={ri} className="flex flex-col justify-around gap-4 w-44 shrink-0">
                <p className="text-xs font-bold mb-1" style={{ color: COLORS.muted, fontFamily: CAIRO }}>{roundName(ri, rounds.length - 1)}</p>
                {Array.from({ length: roundPlayers.length / 2 }).map((_, mi) => {
                  const a = roundPlayers[mi * 2], b = roundPlayers[mi * 2 + 1];
                  const key = `r${ri}m${mi}`;
                  const winner = t.winners[key];
                  return <MatchCard key={key} a={a} b={b} winner={winner} onPick={(pl) => onSetWinner(key, pl)} />;
                })}
              </div>
            ))}
            <div className="flex flex-col justify-center w-40 shrink-0">
              <p className="text-xs font-bold mb-2" style={{ color: COLORS.gold, fontFamily: CAIRO }}>البطل</p>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: COLORS.surface2, border: `1px solid ${COLORS.gold}` }}>
                <Trophy size={20} style={{ color: COLORS.gold, margin: "0 auto 8px" }} />
                <span className="font-black text-sm" style={{ fontFamily: CAIRO }}>
                  {rounds[rounds.length - 1][0] && rounds[rounds.length - 1][0] !== "BYE" ? rounds[rounds.length - 1][0] : "قيد التحديد"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function App() {
  const [tournaments, setTournaments] = useState(seedTournaments);
  const [view, setView] = useState({ screen: "home" });
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Tajawal:wght@400;500;700&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  function createTournament(data) {
    const t = {
      id: "t" + Date.now(),
      name: data.name,
      date: data.date,
      maxPlayers: Number(data.maxPlayers),
      format: data.format,
      code: genCode(),
      players: [],
      winners: {},
    };
    setTournaments((prev) => [t, ...prev]);
    setShowCreate(false);
    setView({ screen: "detail", id: t.id });
    setToast("تم إنشاء الدورة بنجاح");
  }

  function joinTournament(id, name) {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.players.includes(name)) return t;
        if (t.players.length >= t.maxPlayers) return t;
        return { ...t, players: [...t.players, name] };
      })
    );
    setToast("تم التسجيل بنجاح");
  }

  function setWinner(id, key, name) {
    setTournaments((prev) =>
      prev.map((t) => (t.id !== id ? t : { ...t, winners: { ...t.winners, [key]: name } }))
    );
  }

  function copyInvite(code) {
    const url = `dawrty.app/join/${code}`;
    try {
      navigator.clipboard.writeText(url);
    } catch (e) {}
    setToast("تم نسخ رابط الدعوة");
  }

  const active = view.screen === "detail" ? tournaments.find((t) => t.id === view.id) : null;

  return (
    <div dir="rtl" style={{ backgroundColor: COLORS.bg, minHeight: "100vh", fontFamily: TAJAWAL, color: COLORS.text }} className="w-full">
      <header className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: COLORS.line }}>
        <div className="flex items-center gap-2">
          <Trophy size={22} style={{ color: COLORS.gold }} />
          <span className="text-xl font-black" style={{ fontFamily: CAIRO }}>دورتي</span>
        </div>
        {view.screen === "detail" && (
          <button onClick={() => setView({ screen: "home" })} className="flex items-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded" style={{ color: COLORS.muted }}>
            <ArrowRight size={16} /> رجوع
          </button>
        )}
      </header>

      {view.screen === "home" && (
        <HomeScreen tournaments={tournaments} onOpen={(id) => setView({ screen: "detail", id })} onCreateClick={() => setShowCreate(true)} />
      )}

      {active && (
        <DetailScreen
          tournament={active}
          onJoin={(name) => joinTournament(active.id, name)}
          onSetWinner={(key, name) => setWinner(active.id, key, name)}
          onCopyInvite={() => copyInvite(active.code)}
        />
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={createTournament} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold shadow-lg" style={{ backgroundColor: COLORS.gold, color: COLORS.bg }}>
          {toast}
        </div>
      )}
    </div>
  );
}
