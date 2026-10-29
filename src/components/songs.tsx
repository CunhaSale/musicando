import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type N = { n: string; d: number; l: string };
type Raw = [string, number, string];
const mk = (lines: Raw[][]): N[][] => lines.map((ln) => ln.map(([n, d, l]) => ({ n, d, l })));

// d = duração em colcheias (1 = colcheia, 2 = semínima)
export const SONGS = [
  {
    slug: "atirei-o-pau-no-gato",
    title: "Atirei o pau no gato",
    lines: mk([
      [["G",1,"A"],["F",1,"ti"],["E",1,"rei"],["D",1,"o"],["E",1,"pau"],["F",1,"no"],["G",2,"ga"],["G",1,"to"],["G",1,"to"]],
      [["A",1,"Mas"],["G",1,"o"],["F",1,"ga"],["E",1,"to"],["F",1,"to"],["G",1,"não"],["E",1,"mor"],["C",1,"reu"],["C",1,"reu"],["C",1,"reu"]],
      [["G",1,"Do"],["F",1,"na"],["E",1,"Chi"],["D",1,"ca"],["E",1,"ca"],["F",1,"ad"],["G",1,"mi"],["G",1,"rou"],["G",1,"se"],["G",1,"se"]],
      [["A",1,"Do"],["A",1,"ber"],["G",1,"ro"],["F",1,"do"],["E",1,"ber"],["D",1,"ro"],["E",1,"que o"],["F",1,"ga"],["D",1,"to"],["C",2,"deu"],["G",2,"Miau!"]],
    ]),
  },
  {
    slug: "se-essa-rua-fosse-minha",
    title: "Se essa rua fosse minha",
    lines: mk([
      [["G",1,"Se es"],["G",1,"sa"],["C",1,"ru"],["C",1,"a"],["E",2,"se es"],["G",1,"sa"],["C",1,"ru"],["C",1,"a"],["E",1,"fos"],["D",1,"se"],["C",1,"mi"],["D",2,"nha"]],
      [["D",1,"Eu"],["D",1,"man"],["F",1,"da"],["F",1,"va"],["A",2,"eu"],["A",1,"man"],["G",1,"da"],["F",1,"va"],["G",1,"la"],["A",1,"dri"],["G",2,"lhar"]],
      [["G",1,"Com"],["A",1,"pe"],["G",1,"dri"],["E",1,"nhas"],["G",1,"com"],["A",1,"pe"],["G",1,"dri"],["E",1,"nhas"],["F",1,"de"],["E",1,"bri"],["D",1,"lhan"],["C",2,"te"]],
      [["C",1,"Pa"],["D",1,"ra o"],["E",2,"meu"],["C",1,"pa"],["D",1,"ra o"],["E",2,"meu"],["F",1,"a"],["E",1,"mor"],["D",1,"pas"],["C",3,"sar"]],
    ]),
  },
];

const MIDI: Record<string, number> = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69 };
const STEP: Record<string, number> = { C: -2, D: -1, E: 0, F: 1, G: 2, A: 3 };
const TAB: Record<string, [number, number]> = { C: [1, 1], D: [1, 3], E: [0, 0], F: [0, 1], G: [0, 3], A: [0, 5] };
const SOLFEJO: Record<string, string> = { C: "Dó", D: "Ré", E: "Mi", F: "Fá", G: "Sol", A: "Lá" };

const SX = 130, NOTE_W = 70;

export type Song = (typeof SONGS)[number];

export function SongPlayer({ song, full = false }: { song: Song; full?: boolean }) {
  const { title, lines } = song;
  const notes = lines.flat();
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(90);
  const stopRef = useRef<() => void>(() => {});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => stopRef.current(), []);
  useEffect(() => {
    const el = scrollRef.current;
    if (!full && el && active !== null) {
      const x = (SX + active * NOTE_W) * 1.4;
      el.scrollTo({ left: x - el.clientWidth / 3, behavior: "smooth" });
    }
  }, [active]);

  const play = () => {
    if (playing) return stopRef.current();
    const ctx = new AudioContext();
    const eighth = 60 / bpm / 2;
    let t = ctx.currentTime + 0.2;
    const timers: number[] = [];
    notes.forEach((note, i) => {
      const dur = note.d * eighth;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = 440 * Math.pow(2, (MIDI[note.n]! - 69) / 12);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + dur);
      timers.push(window.setTimeout(() => setActive(i), (t - ctx.currentTime) * 1000));
      t += dur;
    });
    const stop = () => { timers.forEach(clearTimeout); ctx.close(); setActive(null); setPlaying(false); };
    timers.push(window.setTimeout(stop, (t - ctx.currentTime) * 1000 + 200));
    stopRef.current = stop;
    setPlaying(true);
  };

  const cur = active !== null ? notes[active] : undefined;
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-5xl font-extrabold leading-tight">{title}</h1>
      <p className="mt-3 text-muted-foreground">Aperte play e acompanhe as notas acendendo na partitura e na tablatura.</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button onClick={play} className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition hover:scale-105">
          {playing ? "■ Parar" : "▶ Tocar"}
        </button>
        <label className="flex items-center gap-2 text-sm">
          Velocidade ♩ = {bpm}
          <input type="range" min={50} max={140} value={bpm} disabled={playing} onChange={(e) => setBpm(+e.target.value)} className="accent-primary" />
        </label>
        {cur && <span className="rounded-full bg-highlight px-4 py-2 font-display text-lg font-semibold">{SOLFEJO[cur.n]} · “{cur.l}”</span>}
      </div>
      {full ? (
        <div className="mt-8 space-y-4 rounded-2xl bg-card p-4 shadow-sm">
          {lines.map((ln, li) => {
            const off = lines.slice(0, li).reduce((a, l) => a + l.length, 0);
            return <Staff key={li} notes={ln} active={active === null ? null : active - off} fit />;
          })}
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="mt-8 overflow-x-auto rounded-2xl bg-card p-4 shadow-sm">
            <Staff notes={notes} active={active} />
          </div>
          <Link href={`/musica/${song.slug}`} className="mt-4 inline-block font-semibold text-primary underline-offset-4 hover:underline">
            Ver partitura completa →
          </Link>
        </>
      )}
    </section>
  );
}

const staffTop = 30, gap = 10, staffBottom = staffTop + gap * 4;
const lyricY = staffBottom + 45, tabTop = lyricY + 25, tg = 12;
const H = tabTop + tg * 5 + 15;

function Staff({ notes, active, fit = false }: { notes: N[]; active: number | null; fit?: boolean }) {
  const W = SX + notes.length * NOTE_W + 40;
  const yFor = (n: string) => staffBottom - STEP[n]! * (gap / 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} {...(fit ? { className: "w-full text-foreground" } : { height: H * 1.4, width: W * 1.4, className: "max-w-none text-foreground" })}>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={20} x2={W - 10} y1={staffTop + i * gap} y2={staffTop + i * gap} stroke="currentColor" />)}
      <text x={24} y={staffBottom + 6} fontSize={62} fill="currentColor">𝄞</text>
      <text x={72} y={staffTop + 19} fontSize={20} fontWeight={700} fill="currentColor">2</text>
      <text x={72} y={staffTop + 39} fontSize={20} fontWeight={700} fill="currentColor">4</text>
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={20} x2={W - 10} y1={tabTop + i * tg} y2={tabTop + i * tg} stroke="currentColor" strokeOpacity={0.5} />)}
      {["T", "A", "B"].map((c, i) => <text key={c} x={28} y={tabTop + 20 + i * 18} fontSize={16} fontWeight={700} fill="currentColor">{c}</text>)}
      <line x1={W - 10} x2={W - 10} y1={staffTop} y2={tabTop + tg * 5} stroke="currentColor" strokeWidth={3} />
      {notes.map((note, i) => {
        const x = SX + i * NOTE_W;
        const on = active === i;
        const y = yFor(note.n);
        const color = on ? "var(--note-active)" : "currentColor";
        const [s, f] = TAB[note.n]!;
        return (
          <g key={i}>
            {on && <rect x={x - 28} y={8} width={56} height={H - 12} rx={8} fill="var(--highlight)" opacity={0.8} />}
            {note.n === "C" && <line x1={x - 13} x2={x + 13} y1={y} y2={y} stroke="currentColor" />}
            <ellipse cx={x} cy={y} rx={7} ry={5} fill={note.d >= 3 ? "none" : color} stroke={color} strokeWidth={1.5} transform={`rotate(-20 ${x} ${y})`} />
            <line x1={x + 6} x2={x + 6} y1={y} y2={y - 32} stroke={color} strokeWidth={1.5} />
            {note.d === 1 && <path d={`M${x + 6} ${y - 32} q 12 8 8 22`} stroke={color} strokeWidth={2} fill="none" />}
            <text x={x} y={lyricY} textAnchor="middle" fontSize={14} fontWeight={on ? 700 : 400} fill={color}>{note.l}</text>
            <rect x={x - 8} y={tabTop + s * tg - 8} width={16} height={16} fill="var(--card)" />
            <text x={x} y={tabTop + s * tg + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>{f}</text>
          </g>
        );
      })}
    </svg>
  );
}
