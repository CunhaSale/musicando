import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type N = { n: string; d: number; l: string };
type Raw = [string, number, string];
const mk = (lines: Raw[][]): N[][] => lines.map((ln) => ln.map(([n, d, l]) => ({ n, d, l })));

function pluck(ctx: AudioContext, freq: number, when: number, ring: number) {
  const sr = ctx.sampleRate;
  const len = Math.max(1, Math.round(sr * ring));
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq));
  // ataque: ruído suavizado (corda "beliscada")
  let prev = 0;
  for (let i = 0; i < period; i++) {
    const r = Math.random() * 2 - 1;
    prev = prev * 0.5 + r * 0.5;
    d[i] = prev;
  }
  // corda: média de duas amostras (filtro) com perda pequena
  const damp = 0.996;
  for (let i = period; i < len; i++) {
    d[i] = damp * 0.5 * (d[i - period] + d[i - period + 1 < i ? i - period + 1 : i - period]);
  }
  // fade final para não dar clique
  const fade = Math.min(len, Math.round(sr * 0.04));
  for (let i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;

  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2500; // som de madeira/nylon, menos "metálico"
  const g = ctx.createGain();
  g.gain.value = 0.9;
  src.connect(lp).connect(g).connect(ctx.destination);
  src.start(when);
}

// d = duração em colcheias (1 = colcheia, 2 = semínima)
export const SONGS = [
    {
    slug: "atirei-o-pau-no-gato",
    title: "Atirei o pau no gato",
    time: "4/4",
    bpm: 100,
    lines: mk([
      [["G",3,"A"],["F",1,"ti"],["E",1,"rei"],["D",1,"o"],["E",1,"pau"],["F",1,"no"],["G",2,"ga"],["G",2,"to"],["G",2,"to"],["A",1,"Mas"],["G",1,"o"]],
      [["F",2,"ga"],["F",2,"to"],["F",2,"to"],["G",1,"não"],["F",1,"mor"],["E",2,"reu"],["E",2,"reu"],["E",2,"reu"],["C",1,"Do"],["C",1,"na"]],
      [["A",2,"Chi"],["A",2,"ca"],["A",2,"ca"],["B",1,"ad"],["A",1,"mi"],["G",2,"rou"],["G",2,"se"],["G",2,"se"],["G",1,"do"],["A",1,"ber"]],
      [["G",2,"ro"],["E",1,"do"],["F",1,"ber"],["G",1,"ro"],["F",1,"que"],["E",1,"o"],["D",1,"ga"],["C",2,"to"],["G",2,"deu"],["C",2,"Miau!"],["R",2,""]],
    ]),
  },
      {
    slug: "se-essa-rua-fosse-minha",
    title: "Se essa rua fosse minha",
    key: "G",
    lines: mk([
      [["B",1,"Se es"],["B",1,"sa"],["E5",1,"ru"],["E5",1,"a"],["B",1,"se es"],["G",1,"sa"],["E",1,"ru"],["G",1,"a"],["D5",1,"fos"],["C5",1,"se"]],
      [["B",2,"mi"],["F#",2,"nha"],["R",2,""],["B",1,"eu"],["B",1,"man"],["F#5",1,"da"],["F#5",1,"va"],["D#5",1,"eu"],["B",1,"man"]],
      [["C5",1,"da"],["B",1,"va"],["G5",1,"la"],["F#5",1,"dri"],["E5",4,"lhar"],["R",2,""],["B",1,"com"],["B",1,"pe"]],
      [["E5",1,"dri"],["E5",1,"nhas"],["G5",1,"com"],["F#5",1,"pe"],["E5",1,"dri"],["D5",1,"nhas"],["C5",1,"de"],["B",1,"bri"],["D5",2,"lhan"],["C5",2,"te"]],
    ]),
  },
  {
    slug: "ciranda-cirandinha",
    title: "Ciranda, cirandinha",
    key: "G",
    lines: mk([
      [["D",1,"Ci"],["G",1,"ran"],["G",1,"da"],["B",1,"ci"],["B",1,"ran"],["D5",1,"di"],["D5",1,"nha"],["C5",1,"va"],["B",1,"mos"],["A",1,"to"],["D5",1,"dos"],["B",1,"ci"],["A",1,"ran"],["G",2,"dar"],["B",1,"va"],["D5",1,"mos"]],
      [["C5",1,"dar"],["B",1,"a"],["A",1,"me"],["G",1,"ia"],["F#",1,"vol"],["D",1,"ta"],["C5",1,"vol"],["A",1,"ta e"],["B",1,"me"],["G",1,"ia"],["A",1,"va"],["F#",1,"mos"],["G",2,"dar"],["D",1,"O"],["D",1,"a"]],
      [["G",1,"nel"],["G",1,"que"],["B",1,"tu"],["B",1,"me"],["D5",1,"des"],["D5",1,"te"],["C5",1,"e"],["B",1,"ra"],["A",1,"vi"],["D5",1,"dro e"],["B",1,"se"],["A",1,"que"],["G",2,"brou"],["B",1,"O"],["D5",1,"a"]],
      [["C5",1,"mor"],["B",1,"que"],["A",1,"tu"],["G",1,"me"],["F#",1,"ti"],["D",1,"nhas"],["C5",1,"e"],["A",1,"ra"],["B",1,"pou"],["G",1,"co e"],["A",1,"se a"],["F#",1,"ca"],["G",3,"bou"]],
    ]),
  },
  // {
  //   slug: "marcha-soldado",
  //   title: "Marcha Soldado",
  //   lines: mk([
  //     [["G",1,"Mar"],["G",1,"cha"],["G",2,"sol"],["E",1,"da"],["E",1,"do"],["C",2,"ca"],["E",1,"be"],["E",1,"ça"],["G",1,"de"],["G",2,"pa"],["E",1,"pel"]],
  //     [["G",1,"Se"],["G",1,"não"],["G",2,"mar"],["E",1,"char"],["E",1,"di"],["C",2,"rei"],["E",1,"to"],["E",1,"vai"],["G",1,"pre"],["G",1,"so"],["E",1,"no"],["C",2,"quar"],["C",2,"tel"]],
  //     [["A",1,"O"],["A",1,"quar"],["G",2,"tel"],["F",1,"pe"],["F",1,"gou"],["E",2,"fo"],["E",1,"go"],["D",1,"a"],["D",1,"po"],["E",1,"lí"],["D",1,"cia"],["C",2,"deu"],["C",2,"si"],["C",2,"nal"]],
  //     [["G",1,"A"],["G",1,"co"],["G",2,"de"],["G",1,"a"],["G",1,"co"],["G",2,"de"],["G",1,"a"],["G",1,"co"],["G",2,"de"],["F",1,"a"],["E",1,"ban"],["D",1,"dei"],["E",1,"ra"],["C",2,"na"],["C",2,"cio"],["C",2,"nal"]],
  //   ]),
  // },
  // {
  //   slug: "o-cravo-e-a-rosa",
  //   title: "O Cravo e a Rosa",
  //   lines: mk([
  //     [["G",1,"O"],["G",1,"cra"],["G",2,"vo"],["F",1,"bri"],["E",1,"gou"],["F",1,"com"],["G",1,"a"],["G",2,"ro"],["G",2,"sa"]],
  //     [["A",1,"De"],["A",1,"bai"],["G",2,"xo"],["F",1,"de"],["E",1,"u"],["F",1,"ma"],["G",1,"sa"],["E",1,"ca"],["C",2,"da"]],
  //     [["G",1,"O"],["G",1,"cra"],["G",2,"vo"],["F",1,"sa"],["E",1,"iu"],["F",1,"fe"],["G",1,"ri"],["G",2,"do"]],
  //     [["A",1,"E"],["A",1,"a"],["G",2,"ro"],["F",1,"sa"],["E",1,"des"],["F",1,"pe"],["G",1,"ta"],["E",1,"la"],["C",2,"da"]],
  //     [["G",1,"O"],["G",1,"cra"],["G",2,"vo"],["F",1,"fi"],["E",1,"cou"],["F",1,"do"],["G",1,"en"],["G",2,"te"]],
  //     [["A",1,"A"],["A",1,"ro"],["G",2,"sa"],["F",1,"foi"],["E",1,"vi"],["F",1,"si"],["G",1,"tar"],["E",1,"zi"],["C",2,"nha"]],
  //   ]),
  // },
];

const MIDI: Record<string, number> = { C: 60, D: 62, E: 64, F: 65, "F#": 66, G: 67, A: 69, B: 71, C5: 72, D5: 74, "D#5": 75, E5: 76, "F#5": 78, G5: 79 };
const STEP: Record<string, number> = { C: -2, D: -1, E: 0, F: 1, "F#": 1, G: 2, A: 3, B: 4, C5: 5, D5: 6, "D#5": 6, E5: 7, "F#5": 8, G5: 9 };
const TAB: Record<string, [number, number]> = { C: [1, 1], D: [1, 3], E: [0, 0], F: [0, 1], "F#": [0, 2], G: [0, 3], A: [0, 5], B: [0, 7], C5: [0, 8], D5: [0, 10], "D#5": [0, 11], E5: [0, 12], "F#5": [0, 14], G5: [0, 15] };
const SOLFEJO: Record<string, string> = { C: "Dó", D: "Ré", E: "Mi", F: "Fá", "F#": "Fá#", G: "Sol", A: "Lá", B: "Si", C5: "Dó", D5: "Ré", "D#5": "Ré#", E5: "Mi", "F#5": "Fá#", G5: "Sol" };
const SX = 130, NOTE_W = 70;

export type Song = (typeof SONGS)[number];

export function SongPlayer({ song, full = false }: { song: Song; full?: boolean }) {
  const { title, lines } = song;
  const notes = lines.flat();
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(song.bpm ?? 90);
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
  if (note.n !== "R") {
    const freq = 440 * Math.pow(2, (MIDI[note.n]! - 69) / 12);
    pluck(ctx, freq, t, Math.max(dur * 1.8, 0.6)); // a corda continua soando um pouco depois
  }
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
            return <Staff timeSig={song.time ?? "2/4"} keyG={song.key === "G"} key={li} notes={ln} active={active === null ? null : active - off} fit />;
          })}
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="mt-8 overflow-x-auto rounded-2xl bg-card p-4 shadow-sm">
            <Staff timeSig={song.time ?? "2/4"} keyG={song.key === "G"} notes={notes} active={active} />
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

function Staff({ timeSig, keyG, notes, active, fit = false }: { timeSig: string; keyG: boolean; notes: N[]; active: number | null; fit?: boolean }) {
  const W = SX + notes.length * NOTE_W + 40;
  const yFor = (n: string) => staffBottom - STEP[n]! * (gap / 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} {...(fit ? { className: "w-full text-foreground" } : { height: H * 1.4, width: W * 1.4, className: "max-w-none text-foreground" })}>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={20} x2={W - 10} y1={staffTop + i * gap} y2={staffTop + i * gap} stroke="currentColor" />)}
      <text x={24} y={staffBottom + 6} fontSize={62} fill="currentColor">𝄞</text>
      {keyG && <text x={58} y={staffTop + 9} fontSize={26} fill="currentColor">♯</text>}
      <text x={72} y={staffTop + 19} fontSize={20} fontWeight={700} fill="currentColor">{timeSig.split("/")[0]}</text>
      <text x={72} y={staffTop + 39} fontSize={20} fontWeight={700} fill="currentColor">{timeSig.split("/")[1]}</text>
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={20} x2={W - 10} y1={tabTop + i * tg} y2={tabTop + i * tg} stroke="currentColor" strokeOpacity={0.5} />)}
      {["T", "A", "B"].map((c, i) => <text key={c} x={28} y={tabTop + 20 + i * 18} fontSize={16} fontWeight={700} fill="currentColor">{c}</text>)}
      <line x1={W - 10} x2={W - 10} y1={staffTop} y2={tabTop + tg * 5} stroke="currentColor" strokeWidth={3} />
      {notes.map((note, i) => {
        const x = SX + i * NOTE_W;
        if (note.n === "R") return <text key={i} x={x} y={staffTop + 22} textAnchor="middle" fontSize={30} fill="currentColor">𝄽</text>;
        const on = active === i;
        const y = yFor(note.n);
        const down = STEP[note.n]! >= 4;
        const color = on ? "var(--note-active)" : "currentColor";
        const [s, f] = TAB[note.n]!;
        return (
          <g key={i}>
            {on && <rect x={x - 28} y={8} width={56} height={H - 12} rx={8} fill="var(--highlight)" opacity={0.8} />}
            {note.n === "C" && <line x1={x - 13} x2={x + 13} y1={y} y2={y} stroke="currentColor" />}
            {note.n === "D#5" && <text x={x - 20} y={y + 6} fontSize={20} fill={color}>♯</text>}
            <ellipse cx={x} cy={y} rx={7} ry={5} fill={note.d >= 3 ? "none" : color} stroke={color} strokeWidth={1.5} transform={`rotate(-20 ${x} ${y})`} />
            <line x1={down ? x - 6 : x + 6} x2={down ? x - 6 : x + 6} y1={y} y2={down ? y + 32 : y - 32} stroke={color} strokeWidth={1.5} />
            {note.d === 1 && <path d={down ? `M${x - 6} ${y + 32} q 12 -8 8 -22` : `M${x + 6} ${y - 32} q 12 8 8 22`} stroke={color} strokeWidth={2} fill="none" />}
            {note.d === 3 && <circle cx={x + 13} cy={y} r={2} fill={color} />}
            <text x={x} y={lyricY} textAnchor="middle" fontSize={14} fontWeight={on ? 700 : 400} fill={color}>{note.l}</text>
            <rect x={x - 8} y={tabTop + s * tg - 8} width={16} height={16} fill="var(--card)" />
            <text x={x} y={tabTop + s * tg + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>{f}</text>
          </g>
        );
      })}
    </svg>
  );
}
