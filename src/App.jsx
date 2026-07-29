import { useState, useEffect, useRef } from "react";
import {
  DoorOpen,
  ShieldCheck,
  UserRound,
  UserRoundX,
  MapPin,
  Clock3,
  MessageCircleHeart,
  AlertTriangle,
  Send,
  ArrowLeft,
  KeyRound,
  ClipboardList,
  CheckCircle2,
  CircleDot,
  Circle,
  PhoneCall,
  Filter,
} from "lucide-react";
import { storageGet, storageSet } from "./storage.js";

// ---------- constants ----------

const VRSTE = [
  "Fizičko nasilje",
  "Verbalno nasilje / vređanje",
  "Isključivanje ili ignorisanje",
  "Onlajn / sajber nasilje",
  "Ucena ili pretnja",
  "Nešto drugo",
];

const MESTA = [
  "Učionica",
  "Hodnik ili stepenište",
  "Školsko dvorište",
  "Onlajn (društvene mreže, poruke)",
  "Van škole",
  "Nešto drugo",
];

const PIN = "1985";
const STORAGE_KEY = "vrsnjacko-nasilje-prijave";

const EMAILJS = {
  serviceId: "TVOJ_SERVICE_ID",
  templateId: "TVOJ_TEMPLATE_ID",
  publicKey: "TVOJ_PUBLIC_KEY",
  psihologEmail: "psiholog@skola.rs",
};

async function posaljiMejl(prijava) {
  if (EMAILJS.serviceId === "TVOJ_SERVICE_ID") return;
  await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: EMAILJS.templateId,
      user_id: EMAILJS.publicKey,
      template_params: {
        to_email: EMAILJS.psihologEmail,
        hitno: prijava.hitno ? "DA — HITNO" : "Ne",
        podnosilac: prijava.anoniman ? "Anonimno" : prijava.ime || "Bez imena",
        razred: prijava.razred || "—",
        vrsta: prijava.vrsta,
        mesto: prijava.mesto,
        ponavlja_se: prijava.ponavljaSe ? "Da" : "Ne",
        opis: prijava.opis,
        ukljuceni: prijava.ukljuceni || "—",
        kontakt: prijava.kontakt || "—",
        vreme: formatDatum(prijava.vreme),
      },
    }),
  });
}

function noviId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDatum(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("sr-Latn-RS", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + d.toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

// ---------- breathing dot signature element ----------

function DisajuciKrug({ tone = "calm" }) {
  const color = tone === "urgent" ? "#C9713C" : "#7FA99B";
  return (
    <div className="relative w-16 h-16 mx-auto">
      <div
        className="absolute inset-0 rounded-full opacity-30 animate-ping-slow"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute inset-2 rounded-full opacity-60 animate-ping-slower"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute inset-5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ---------- App ----------

export default function App() {
  const [view, setView] = useState("report"); // report | confirm | gate | dashboard
  const [poslednjaPrijava, setPoslednjaPrijava] = useState(null);

  return (
    <div className="min-h-screen w-full bg-[#F6F3EC] text-[#243138]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        @keyframes ping-slow { 0% { transform: scale(1); opacity: .35; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes ping-slower { 0% { transform: scale(1); opacity: .5; } 100% { transform: scale(1.5); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2.8s cubic-bezier(0.2,0.6,0.4,1) infinite; }
        .animate-ping-slower { animation: ping-slower 2.8s cubic-bezier(0.2,0.6,0.4,1) infinite .4s; }
        @media (prefers-reduced-motion: reduce) {
          .animate-ping-slow, .animate-ping-slower { animation: none; }
        }
      `}</style>

      <TopBar view={view} setView={setView} />

      <main className="max-w-2xl mx-auto px-5 pb-24 pt-6 sm:pt-10">
        {view === "report" && (
          <ReportForm
            onSubmitted={(prijava) => {
              setPoslednjaPrijava(prijava);
              setView("confirm");
            }}
          />
        )}
        {view === "confirm" && (
          <Potvrda prijava={poslednjaPrijava} onNova={() => setView("report")} />
        )}
        {view === "gate" && <PsihologGate onUspeh={() => setView("dashboard")} onNazad={() => setView("report")} />}
        {view === "dashboard" && <PsihologDashboard onNazad={() => setView("report")} />}
      </main>
    </div>
  );
}

function TopBar({ view, setView }) {
  return (
    <header className="border-b border-[#DCD5C4]">
      <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <DoorOpen className="w-5 h-5 text-[#2B4C5C]" strokeWidth={1.75} />
          <span className="font-display text-[17px] tracking-tight text-[#2B4C5C]">Vrata su otvorena</span>
        </div>
        {(view === "report" || view === "confirm") && (
          <button
            onClick={() => setView("gate")}
            className="font-body text-[13px] text-[#6B6255] hover:text-[#2B4C5C] transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" strokeWidth={1.75} />
            Za psihologa
          </button>
        )}
        {view !== "report" && view !== "confirm" && (
          <button
            onClick={() => setView("report")}
            className="font-body text-[13px] text-[#6B6255] hover:text-[#2B4C5C] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            Nazad na prijavu
          </button>
        )}
      </div>
    </header>
  );
}

// ---------- Report form ----------

function ReportForm({ onSubmitted }) {
  const [anoniman, setAnoniman] = useState(true);
  const [ime, setIme] = useState("");
  const [razred, setRazred] = useState("");
  const [vrsta, setVrsta] = useState(VRSTE[0]);
  const [mesto, setMesto] = useState(MESTA[0]);
  const [ponavljaSe, setPonavljaSe] = useState(false);
  const [opis, setOpis] = useState("");
  const [ukljuceni, setUkljuceni] = useState("");
  const [hitno, setHitno] = useState(false);
  const [kontakt, setKontakt] = useState("");
  const [greska, setGreska] = useState("");
  const [saljem, setSaljem] = useState(false);

  async function posalji(e) {
    e.preventDefault();
    if (opis.trim().length < 10) {
      setGreska("Napiši nekoliko rečenica o tome šta se dešava — to psihologu najviše pomaže.");
      return;
    }
    setGreska("");
    setSaljem(true);

    const prijava = {
      id: noviId(),
      vreme: new Date().toISOString(),
      anoniman,
      ime: anoniman ? "" : ime.trim(),
      razred: razred.trim(),
      vrsta,
      mesto,
      ponavljaSe,
      opis: opis.trim(),
      ukljuceni: ukljuceni.trim(),
      hitno,
      kontakt: kontakt.trim(),
      status: "nova",
    };

    try {
      let postojece = [];
      try {
        const rezultat = await storageGet(STORAGE_KEY, true);
        if (rezultat?.value) postojece = JSON.parse(rezultat.value);
      } catch {
        postojece = [];
      }
      postojece.push(prijava);
      await storageSet(STORAGE_KEY, JSON.stringify(postojece), true);
      try {
        await posaljiMejl(prijava);
      } catch {
        /* mejl nije stigao, ali prijava je sačuvana i vidljiva u pregledu za psihologa */
      }
      onSubmitted(prijava);
    } catch {
      setGreska("Prijava nije mogla da se pošalje. Pokušaj ponovo za trenutak.");
    } finally {
      setSaljem(false);
    }
  }

  return (
    <form onSubmit={posalji} className="space-y-8">
      <div>
        <h1 className="font-display text-[28px] sm:text-[32px] leading-tight text-[#2B4C5C]">
          Ako ti neko otežava dane u školi,
          <br /> ovde to možeš da kažeš.
        </h1>
        <p className="font-body text-[14.5px] text-[#6B6255] mt-2.5 leading-relaxed">
          Ovu poruku vidi samo školski psiholog. Nema pogrešnog trenutka da je pošalješ.
        </p>
      </div>

      {/* Anonymity choice — signature interaction */}
      <div>
        <p className="font-body text-[13px] font-medium text-[#425A67] mb-2.5">Kako želiš da pošalješ prijavu?</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAnoniman(true)}
            className={`text-left rounded-2xl border p-4 transition-all ${
              anoniman ? "border-[#2B4C5C] bg-[#EAF0EE] shadow-sm" : "border-[#DCD5C4] bg-white/60 hover:border-[#B9AF9A]"
            }`}
          >
            <UserRoundX className={`w-5 h-5 mb-2 ${anoniman ? "text-[#2B4C5C]" : "text-[#9A9082]"}`} strokeWidth={1.75} />
            <div className="font-body text-[14px] font-semibold text-[#2B4C5C]">Anonimno</div>
            <div className="font-body text-[12px] text-[#6B6255] mt-0.5">Ne ostavljaš ime</div>
          </button>
          <button
            type="button"
            onClick={() => setAnoniman(false)}
            className={`text-left rounded-2xl border p-4 transition-all ${
              !anoniman ? "border-[#2B4C5C] bg-[#EAF0EE] shadow-sm" : "border-[#DCD5C4] bg-white/60 hover:border-[#B9AF9A]"
            }`}
          >
            <UserRound className={`w-5 h-5 mb-2 ${!anoniman ? "text-[#2B4C5C]" : "text-[#9A9082]"}`} strokeWidth={1.75} />
            <div className="font-body text-[14px] font-semibold text-[#2B4C5C]">Sa mojim imenom</div>
            <div className="font-body text-[12px] text-[#6B6255] mt-0.5">Psiholog zna ko si</div>
          </button>
        </div>
      </div>

      {!anoniman && (
        <Polje label="Ime i prezime">
          <input
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            placeholder="Kako da te oslovljavamo"
            className={ulazKlasa}
          />
        </Polje>
      )}

      <Polje label="Razred i odeljenje (opciono)">
        <input
          value={razred}
          onChange={(e) => setRazred(e.target.value)}
          placeholder="npr. 7-2"
          className={ulazKlasa}
        />
      </Polje>

      <div className="grid sm:grid-cols-2 gap-5">
        <Polje label="O kakvom nasilju je reč">
          <select value={vrsta} onChange={(e) => setVrsta(e.target.value)} className={ulazKlasa}>
            {VRSTE.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Polje>
        <Polje label={<span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />Gde se dešava</span>}>
          <select value={mesto} onChange={(e) => setMesto(e.target.value)} className={ulazKlasa}>
            {MESTA.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Polje>
      </div>

      <Polje label="Šta se dešava — opiši svojim rečima">
        <textarea
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          rows={5}
          placeholder="Piši koliko god ti prija — datumi, situacije, kako se osećaš. Sve pomaže."
          className={ulazKlasa + " resize-none"}
        />
      </Polje>

      <Polje label="Ko je uključen (opciono, ako želiš da podeliš)">
        <textarea
          value={ukljuceni}
          onChange={(e) => setUkljuceni(e.target.value)}
          rows={2}
          placeholder="Imena ili opis — nije obavezno"
          className={ulazKlasa + " resize-none"}
        />
      </Polje>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={ponavljaSe}
          onChange={(e) => setPonavljaSe(e.target.checked)}
          className="w-4 h-4 accent-[#2B4C5C]"
        />
        <span className="font-body text-[13.5px] text-[#425A67] flex items-center gap-1.5">
          <Clock3 className="w-3.5 h-3.5" strokeWidth={1.75} />
          Ovo se dešava više puta, ne prvi put
        </span>
      </label>

      <div
        className={`rounded-2xl border p-4 transition-colors ${
          hitno ? "border-[#C9713C] bg-[#FBF0E6]" : "border-[#DCD5C4] bg-white/60"
        }`}
      >
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hitno}
            onChange={(e) => setHitno(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-[#C9713C]"
          />
          <span>
            <span className="font-body text-[13.5px] font-semibold text-[#8C4A20] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
              Hitno je — potrebna mi je pomoć što pre
            </span>
            <span className="font-body text-[12.5px] text-[#8C4A20] block mt-1 leading-relaxed">
              Ovo obeleži ako se osećaš nebezbedno sada. Psiholog dobija hitne prijave odmah.
            </span>
          </span>
        </label>
      </div>

      <Polje label={<span className="flex items-center gap-1.5"><MessageCircleHeart className="w-3.5 h-3.5" strokeWidth={1.75} />Kako da ti odgovorimo (opciono)</span>}>
        <input
          value={kontakt}
          onChange={(e) => setKontakt(e.target.value)}
          placeholder="Mejl, broj telefona, ili gde te psiholog može pronaći"
          className={ulazKlasa}
        />
      </Polje>

      {greska && (
        <p className="font-body text-[13px] text-[#B4432E] bg-[#FBEAE6] border border-[#F0C6BB] rounded-xl px-3.5 py-2.5">
          {greska}
        </p>
      )}

      <button
        type="submit"
        disabled={saljem}
        className="w-full font-body font-semibold text-[14.5px] text-white bg-[#2B4C5C] hover:bg-[#233F4C] disabled:opacity-60 rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-colors"
      >
        <Send className="w-4 h-4" strokeWidth={1.75} />
        {saljem ? "Šaljem…" : "Pošalji prijavu psihologu"}
      </button>

      <p className="font-body text-[12px] text-[#9A9082] text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
        Prijavu čita samo školski psiholog
      </p>
    </form>
  );
}

const ulazKlasa =
  "w-full font-body text-[14px] text-[#243138] bg-white border border-[#DCD5C4] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B4C5C] focus:ring-2 focus:ring-[#2B4C5C]/15 transition-shadow placeholder:text-[#B0A996]";

function Polje({ label, children }) {
  return (
    <label className="block">
      <span className="font-body text-[13px] font-medium text-[#425A67] mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

// ---------- Confirmation ----------

function Potvrda({ prijava, onNova }) {
  if (!prijava) return null;
  return (
    <div className="text-center py-10">
      <DisajuciKrug tone={prijava.hitno ? "urgent" : "calm"} />
      <h2 className="font-display text-[24px] text-[#2B4C5C] mt-8">Prijava je bezbedno stigla</h2>
      <p className="font-body text-[14.5px] text-[#6B6255] mt-3 max-w-md mx-auto leading-relaxed">
        {prijava.anoniman
          ? "Poslata je anonimno. Psiholog će je pročitati i razmisliti o sledećem koraku."
          : "Psiholog zna da je poruka od tebe i javiće se čim bude mogao."}
      </p>

      {prijava.hitno && (
        <div className="mt-6 mx-auto max-w-md rounded-2xl border border-[#F0C6BB] bg-[#FBF0E6] p-4 text-left">
          <p className="font-body text-[13.5px] font-semibold text-[#8C4A20] flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4" strokeWidth={1.75} />
            Ako se sada osećaš nebezbedno
          </p>
          <p className="font-body text-[13px] text-[#8C4A20] mt-1.5 leading-relaxed">
            Javi se odmah nastavniku, dežurnom ili nekom odraslom u koga imaš poverenja. Dečji telefon
            116 111 je besplatan i dostupan, i tu je za razgovor u svakom trenutku.
          </p>
        </div>
      )}

      <button
        onClick={onNova}
        className="mt-8 font-body text-[13.5px] text-[#2B4C5C] border border-[#DCD5C4] hover:border-[#2B4C5C] rounded-xl px-5 py-2.5 transition-colors"
      >
        Pošalji još jednu prijavu
      </button>
    </div>
  );
}

// ---------- Psychologist gate ----------

function PsihologGate({ onUspeh, onNazad }) {
  const [pin, setPin] = useState("");
  const [greska, setGreska] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function proveri(e) {
    e.preventDefault();
    if (pin === PIN) {
      onUspeh();
    } else {
      setGreska("Pogrešan PIN.");
    }
  }

  return (
    <div className="max-w-xs mx-auto py-16 text-center">
      <KeyRound className="w-6 h-6 text-[#2B4C5C] mx-auto" strokeWidth={1.75} />
      <h2 className="font-display text-[21px] text-[#2B4C5C] mt-4">Pristup za psihologa</h2>
      <p className="font-body text-[13px] text-[#6B6255] mt-1.5">Unesi PIN za pregled prijava</p>
      <form onSubmit={proveri} className="mt-6">
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className={ulazKlasa + " text-center tracking-[0.3em]"}
          placeholder="••••"
        />
        {greska && <p className="font-body text-[12.5px] text-[#B4432E] mt-2">{greska}</p>}
        <button
          type="submit"
          className="w-full mt-4 font-body font-semibold text-[13.5px] text-white bg-[#2B4C5C] hover:bg-[#233F4C] rounded-xl py-2.5 transition-colors"
        >
          Uđi
        </button>
      </form>
      <button onClick={onNazad} className="mt-5 font-body text-[12.5px] text-[#9A9082] hover:text-[#6B6255]">
        Nazad
      </button>
    </div>
  );
}

// ---------- Psychologist dashboard ----------

const STATUSI = ["nova", "u obradi", "rešena"];
const STATUS_LABEL = { nova: "Nova", "u obradi": "U obradi", rešena: "Rešena" };
const STATUS_ICON = { nova: CircleDot, "u obradi": Circle, rešena: CheckCircle2 };

function PsihologDashboard({ onNazad }) {
  const [prijave, setPrijave] = useState(null);
  const [filter, setFilter] = useState("sve");
  const [otvorena, setOtvorena] = useState(null);

  async function ucitaj() {
    try {
      const rezultat = await storageGet(STORAGE_KEY, true);
      const lista = rezultat?.value ? JSON.parse(rezultat.value) : [];
      lista.sort((a, b) => new Date(b.vreme) - new Date(a.vreme));
      setPrijave(lista);
    } catch {
      setPrijave([]);
    }
  }

  useEffect(() => {
    ucitaj();
  }, []);

  async function promeniStatus(id, status) {
    const azurirano = prijave.map((p) => (p.id === id ? { ...p, status } : p));
    setPrijave(azurirano);
    try {
      await storageSet(STORAGE_KEY, JSON.stringify(azurirano), true);
    } catch {
      /* tiho, lokalni prikaz ostaje ažuran */
    }
  }

  if (prijave === null) {
    return <p className="font-body text-[13.5px] text-[#9A9082] text-center py-16">Učitavanje prijava…</p>;
  }

  const filtrirane = prijave.filter((p) => {
    if (filter === "sve") return true;
    if (filter === "hitno") return p.hitno;
    return p.status === filter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-[22px] text-[#2B4C5C] flex items-center gap-2">
          <ClipboardList className="w-5 h-5" strokeWidth={1.75} />
          Prijave ({prijave.length})
        </h2>
        <button onClick={onNazad} className="font-body text-[12.5px] text-[#9A9082] hover:text-[#6B6255]">
          Odjavi se
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        <Filter className="w-3.5 h-3.5 text-[#9A9082] mr-1" strokeWidth={1.75} />
        {["sve", "hitno", ...STATUSI].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-body text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? "border-[#2B4C5C] bg-[#2B4C5C] text-white"
                : "border-[#DCD5C4] text-[#6B6255] hover:border-[#B9AF9A]"
            }`}
          >
            {f === "sve" ? "Sve" : f === "hitno" ? "Hitno" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {filtrirane.length === 0 && (
        <p className="font-body text-[13.5px] text-[#9A9082] text-center py-16">Nema prijava u ovoj kategoriji.</p>
      )}

      <div className="space-y-3">
        {filtrirane.map((p) => {
          const Ikona = STATUS_ICON[p.status] || CircleDot;
          const jeOtvorena = otvorena === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white/70 transition-colors ${
                p.hitno ? "border-[#EBB597]" : "border-[#DCD5C4]"
              }`}
            >
              <button
                onClick={() => setOtvorena(jeOtvorena ? null : p.id)}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.hitno && (
                      <span className="font-body text-[10.5px] font-semibold uppercase tracking-wide text-[#8C4A20] bg-[#FBF0E6] border border-[#F0C6BB] rounded-full px-2 py-0.5">
                        Hitno
                      </span>
                    )}
                    <span className="font-body text-[13.5px] font-medium text-[#243138] truncate">
                      {p.vrsta}
                    </span>
                  </div>
                  <div className="font-body text-[12px] text-[#9A9082] mt-1">
                    {p.anoniman ? "Anonimno" : p.ime || "Bez imena"} · {formatDatum(p.vreme)}
                  </div>
                </div>
                <Ikona className="w-4 h-4 text-[#2B4C5C] shrink-0" strokeWidth={1.75} />
              </button>

              {jeOtvorena && (
                <div className="px-4 pb-4 pt-1 border-t border-[#EAE4D6] space-y-3">
                  <Detalj label="Mesto" vrednost={p.mesto} />
                  {p.razred && <Detalj label="Razred" vrednost={p.razred} />}
                  <Detalj label="Ponavlja se" vrednost={p.ponavljaSe ? "Da" : "Ne / nije naznačeno"} />
                  <Detalj label="Opis" vrednost={p.opis} />
                  {p.ukljuceni && <Detalj label="Ko je uključen" vrednost={p.ukljuceni} />}
                  {p.kontakt && <Detalj label="Kontakt" vrednost={p.kontakt} />}

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="font-body text-[12px] text-[#9A9082] mr-1">Status:</span>
                    {STATUSI.map((s) => (
                      <button
                        key={s}
                        onClick={() => promeniStatus(p.id, s)}
                        className={`font-body text-[11.5px] px-2.5 py-1 rounded-full border transition-colors ${
                          p.status === s
                            ? "border-[#2B4C5C] bg-[#2B4C5C] text-white"
                            : "border-[#DCD5C4] text-[#6B6255] hover:border-[#B9AF9A]"
                        }`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Detalj({ label, vrednost }) {
  return (
    <div>
      <div className="font-body text-[11px] uppercase tracking-wide text-[#9A9082]">{label}</div>
      <div className="font-body text-[13.5px] text-[#243138] leading-relaxed">{vrednost}</div>
    </div>
  );
}
