import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, Marquee, MaskLines, ParallaxImg, Reveal } from "./lib/kit";
import { img } from "./lib/img";

/* ================================================================== */
/*  Data                                                               */
/* ================================================================== */
const IMG = {
  rows: img("clay-rows.jpg"),
  bud: img("clay-bud.jpg"),
  ochre: img("clay-ochre.jpg"),
  ribbed: img("clay-ribbed.jpg"),
  duo: img("clay-duo.jpg"),
  terra: img("clay-terra.jpg"),
  potter: img("clay-potter.jpg"),
  detail: img("clay-detail.jpg"),
  studio: img("clay-studio.jpg"),
};

type Cat = "Vases" | "Sets" | "Planters";
type Product = {
  id: string;
  name: string;
  cat: Cat;
  material: string;
  dims: string;
  price: number;
  img: string;
  soldOut?: boolean;
};

const PRODUCTS: Product[] = [
  { id: "fila", name: "Fila, five bisque vases", cat: "Sets", material: "Unglazed stoneware", dims: "H 18–26 cm", price: 220, img: IMG.rows },
  { id: "bud", name: "Petit Bud Vase, Chalk", cat: "Vases", material: "Satin porcelain glaze", dims: "H 11 cm", price: 48, img: IMG.bud },
  { id: "ocre", name: "Ocre Bottle Pair", cat: "Sets", material: "Matte ochre stoneware", dims: "H 24 & 26 cm", price: 96, img: IMG.ochre },
  { id: "canne", name: "Cannelé Tier Vase", cat: "Vases", material: "Wheel-thrown, hand-fluted", dims: "H 20 cm", price: 124, img: IMG.ribbed },
  { id: "duo", name: "Cannelé Duo, Ivory & Ochre", cat: "Sets", material: "Ribbed stoneware", dims: "H 26 & 30 cm", price: 138, img: IMG.duo, soldOut: true },
  { id: "sablier", name: "Sablier Planter", cat: "Planters", material: "Raw Provençal terracotta", dims: "H 22 cm · Ø 21 cm", price: 72, img: IMG.terra },
];

const STEPS = [
  { n: "01", t: "Wedge", d: "Every kilo of Aubagne clay is wedged by hand for ten minutes to drive out the air. Skip it, and the piece bursts in the kiln." },
  { n: "02", t: "Throw", d: "One piece at a time on the wheel, from a single ball. No moulds and no casting, which is why no two are the same height." },
  { n: "03", t: "Dry", d: "A slow week under cloth. Clay that dries too fast warps; clay that dries too slowly grows mould. The studio window faces north for a reason." },
  { n: "04", t: "Bisque", d: "A first firing to 960 °C turns soft clay into a chalky, porous ceramic. Strong enough to handle, still thirsty enough to take glaze." },
  { n: "05", t: "Glaze", d: "Dipped once, by hand, in glazes we mix ourselves from ash, feldspar and iron. The colour you see is decided here." },
  { n: "06", t: "Fire", d: "The glaze firing climbs to 1,260 °C over twelve hours and takes two days to cool. About one piece in eight does not come out." },
];

const SHIP_FREE = 150;
const SHIP_COST = 9;
const eur = (n: number) => `€${n.toLocaleString("en-US")}`;

const nextSaturdays = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (((6 - d.getDay() + 7) % 7) || 7));
  return Array.from({ length: n }, (_, i) => {
    const c = new Date(d);
    c.setDate(c.getDate() + i * 7);
    return c;
  });
};
const SEATS = [6, 3, 8, 1];
const WORKSHOP_PRICE = 95;

/* ================================================================== */
/*  Small pieces                                                       */
/* ================================================================== */
function Badge() {
  return (
    <svg viewBox="0 0 120 120" className="spin-slow h-full w-full" aria-hidden="true">
      <defs>
        <path id="argile-circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" fill="none" />
      </defs>
      <text
        fill="currentColor"
        style={{ fontSize: 8.4, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-dmsans)", fontWeight: 500 }}
      >
        <textPath href="#argile-circ" textLength="268" lengthAdjust="spacing">
          Hand thrown · Marseille · Since 2016 ·
        </textPath>
      </text>
    </svg>
  );
}

function Arch({ src, alt, className, amount }: { src: string; alt: string; className: string; amount: number }) {
  return (
    <Reveal className={className} y={40}>
      <ParallaxImg src={src} alt={alt} amount={amount} className="h-full w-full rounded-t-[999px] bg-sand" />
    </Reveal>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function Argile() {
  const [solid, setSolid] = useState(false);
  const [filter, setFilter] = useState<"All" | Cat>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState<string | null>(null);
  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);

  const [sessions] = useState(() => nextSaturdays(4));
  const [session, setSession] = useState(0);
  const [seats, setSeats] = useState(2);
  const [wName, setWName] = useState("");
  const [wEmail, setWEmail] = useState("");
  const [wErr, setWErr] = useState("");
  const [booked, setBooked] = useState(false);

  const [nl, setNl] = useState("");
  const [nlDone, setNlDone] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen]);

  const add = (id: string) => {
    setOrder(null);
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    setCartOpen(true);
  };
  const setQty = (id: string, q: number) =>
    setCart((c) => {
      const n = { ...c };
      if (q <= 0) delete n[id];
      else n[id] = q;
      return n;
    });

  const lines = PRODUCTS.filter((p) => cart[p.id]).map((p) => ({ p, qty: cart[p.id] }));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= SHIP_FREE ? 0 : SHIP_COST;
  const toFree = Math.max(0, SHIP_FREE - subtotal);

  const shown = PRODUCTS.filter((p) => filter === "All" || p.cat === filter);
  const maxSeats = Math.min(4, SEATS[session]);
  const dateLabel = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(d);

  const reserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wName.trim()) return setWErr("Your name, please.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wEmail)) return setWErr("A working email, please.");
    setWErr("");
    setBooked(true);
  };

  return (
    <div className="min-h-screen bg-cream font-dmsans text-umber selection:bg-terra selection:text-cream">
      {/* ================= NAV ================= */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid ? "border-b border-umber/10 bg-cream/95 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto grid h-[68px] max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-12">
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ["#shop", "Shop"],
              ["#studio", "The studio"],
              ["#workshops", "Workshops"],
            ].map(([h, l]) => (
              <a key={h} href={h} className="group relative py-1 text-[14px]">
                {l}
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-umber transition-transform duration-500 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          <span className="md:hidden" />
          <a href="#top" className="argile-soft text-[2rem] font-normal leading-none tracking-[-0.02em]">
            Argile
          </a>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            data-cursor="grow"
            className="flex items-center gap-2.5 justify-self-end text-[14px]"
          >
            Bag
            <span
              className={`num grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[12px] font-medium transition-colors duration-300 ${
                count > 0 ? "bg-terra text-cream" : "border border-umber/30"
              }`}
            >
              {count}
            </span>
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section id="top" className="relative overflow-hidden pb-20 pt-32 lg:pt-36">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.22em] text-umber/60">
            Atelier de céramique · Marseille
          </p>
          <MaskLines
            inView={false}
            delay={0.15}
            className="mt-6 block text-center argile-soft font-light leading-[0.94] tracking-[-0.035em]"
            lines={[
              <span key="a" style={{ fontSize: "clamp(2.8rem, 9.4vw, 9rem)" }}>Shaped by hand,</span>,
              <span key="b" style={{ fontSize: "clamp(2.8rem, 9.4vw, 9rem)" }}>
                <em className="italic text-terra">fired in the south.</em>
              </span>,
            ]}
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
            className="mx-auto mt-8 max-w-[46ch] text-center text-[16px] leading-[1.7] text-umber/75"
          >
            A small studio making vases, vessels and planters from Provençal clay. Thrown on the wheel, glazed once, and
            fired until they are ready.
          </motion.p>

          <div className="relative mt-16 grid grid-cols-12 items-end gap-3 sm:gap-5">
            <Arch src={IMG.rows} alt="Rows of unglazed vases on a drying rack" amount={8} className="col-span-4 h-[36vh] sm:h-[50vh]" />
            <Arch src={IMG.ribbed} alt="A ribbed ceramic vase on a block of stone" amount={14} className="col-span-4 h-[50vh] sm:h-[66vh]" />
            <Arch src={IMG.ochre} alt="Two ochre bottle vases" amount={10} className="col-span-4 h-[42vh] sm:h-[56vh]" />

            <div className="pointer-events-none absolute left-1/2 top-[6%] z-10 h-28 w-28 -translate-x-1/2 rounded-full bg-cream text-terra shadow-[0_18px_40px_-22px_rgba(42,29,22,0.6)] sm:h-36 sm:w-36 lg:left-[66.5%]">
              <Badge />
            </div>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="overflow-hidden bg-terra py-3.5 text-cream">
        <Marquee duration={40}>
          {["Stoneware", "Porcelain", "Terracotta", "Raku", "Fired at 1,260 °C", "Made in Marseille"].map((w) => (
            <span key={w} className="flex items-center">
              <span className="argile-soft px-8 text-[clamp(1.4rem,2.6vw,2.2rem)] font-light italic">{w}</span>
              <span className="text-[1.2rem]">✺</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ================= SHOP ================= */}
      <section id="shop" className="px-5 py-28 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-terra">The current firing</p>
              <h2 className="mt-4 argile-soft text-[clamp(2.6rem,6.4vw,6rem)] font-light leading-[0.95] tracking-[-0.03em]">
                Six pieces, <em className="italic">this month</em>.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
              {(["All", "Vases", "Sets", "Planters"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  data-cursor="grow"
                  className={`rounded-full border px-5 py-2 text-[13px] font-medium transition-colors duration-300 ${
                    filter === f
                      ? "border-umber bg-umber text-cream"
                      : "border-umber/25 hover:border-umber"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }}
                  className="group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-sand">
                    <img
                      src={p.img}
                      alt={p.name}
                      className={`h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06] ${
                        p.soldOut ? "opacity-70 saturate-50" : ""
                      }`}
                    />
                    {p.soldOut && (
                      <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-cream px-4 py-1.5 text-[12px] font-medium">
                        Sold out
                      </span>
                    )}
                  </div>
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="argile-soft text-[1.55rem] font-light leading-[1.1] tracking-[-0.01em]">{p.name}</h3>
                      <p className="mt-1.5 text-[13px] text-umber/60">
                        {p.material} · {p.dims}
                      </p>
                    </div>
                    <p className="num text-[1.1rem] font-medium">{eur(p.price)}</p>
                  </div>
                  {p.soldOut ? (
                    <button
                      type="button"
                      onClick={() => setNotified((n) => ({ ...n, [p.id]: true }))}
                      disabled={notified[p.id]}
                      data-cursor="grow"
                      className="mt-4 text-[13px] font-medium underline underline-offset-4 disabled:no-underline disabled:opacity-60"
                    >
                      {notified[p.id] ? "We’ll write when the kiln opens" : "Notify me — next firing 12 June"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => add(p.id)}
                      data-cursor="label"
                      data-cursor-label="Add"
                      className="mt-4 rounded-full border border-umber px-5 py-2 text-[13px] font-medium transition-colors duration-300 hover:bg-umber hover:text-cream"
                    >
                      Add to bag
                    </button>
                  )}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ================= STUDIO / PROCESS ================= */}
      <section id="studio" className="bg-umber px-5 py-28 text-cream sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-6 border-b border-cream/20 pb-14 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1,260 °C", "Glaze firing temperature"],
              ["9 days", "From wedging to shelf"],
              ["1 in 8", "Pieces that don’t survive the kiln"],
              ["0", "Moulds. Ever."],
            ].map(([k, v], i) => (
              <Reveal key={v} delay={i * 0.06}>
                <p className="num argile-soft text-[clamp(2.4rem,4.6vw,4.2rem)] font-light leading-none tracking-[-0.02em] text-sand">{k}</p>
                <p className="mt-3 text-[13px] text-cream/60">{v}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-20 grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_1fr] lg:gap-24">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-t-[999px] bg-umber">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.img
                    key={step < 3 ? "potter" : "detail"}
                    src={step < 3 ? IMG.potter : IMG.detail}
                    alt={step < 3 ? "A potter working a vase with a torch" : "Close-up of a glazed ceramic surface"}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
              <div className="mx-auto mt-6 flex max-w-[460px] items-baseline justify-between text-[13px] text-cream/60">
                <span className="num">
                  Step {STEPS[step].n} / 06
                </span>
                <span className="argile-soft text-[1.2rem] italic text-sand">{STEPS[step].t}</span>
              </div>
              <div className="mx-auto mt-3 h-px max-w-[460px] bg-cream/20">
                <motion.div
                  className="h-full origin-left bg-terra"
                  animate={{ scaleX: (step + 1) / STEPS.length }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>
            </div>

            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-sand/80">The studio</p>
              <h2 className="mt-4 argile-soft text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-[1] tracking-[-0.03em]">
                Nothing here is <em className="italic text-sand">hurried</em>.
              </h2>
              <ol className="mt-14">
                {STEPS.map((s, i) => (
                  <motion.li
                    key={s.n}
                    onViewportEnter={() => setStep(i)}
                    viewport={{ margin: "-45% 0px -45% 0px" }}
                    className={`grid min-h-[42vh] grid-cols-[3.4rem_1fr] gap-5 border-t border-cream/15 pt-8 transition-opacity duration-700 ${
                      step === i ? "opacity-100" : "opacity-35"
                    }`}
                  >
                    <span className="num argile-soft text-[1.6rem] font-light italic text-terra">{s.n}</span>
                    <div>
                      <h3 className="argile-soft text-[clamp(2rem,3.6vw,3rem)] font-light leading-none tracking-[-0.02em]">{s.t}</h3>
                      <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.75] text-cream/75">{s.d}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WORKSHOPS ================= */}
      <section id="workshops" className="bg-sand px-5 py-28 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[minmax(0,0.8fr)_1fr] lg:gap-24">
          <div>
            <Reveal>
              <div className="mx-auto aspect-[4/5] w-full max-w-[440px]">
                <ParallaxImg
                  src={IMG.studio}
                  alt="A potter examining a freshly thrown cup"
                  amount={9}
                  className="h-full w-full rounded-t-[999px] bg-cream"
                />
              </div>
            </Reveal>
          </div>

          <div className="lg:pt-10">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-terra">Workshops</p>
            <h2 className="mt-4 argile-soft text-[clamp(2.6rem,5.6vw,5.2rem)] font-light leading-[0.96] tracking-[-0.03em]">
              Sit at the <em className="italic text-terra">wheel</em>.
            </h2>
            <p className="mt-6 max-w-[46ch] text-[16px] leading-[1.7] text-umber/75">
              Three hours, four people at most, and your first bowl. You take it home once it has been fired — about
              three weeks later.
            </p>

            {booked ? (
              <div className="mt-12 border border-umber/25 bg-cream p-8">
                <p className="argile-soft text-[2.2rem] font-light italic leading-tight">Merci, {wName.split(" ")[0]}.</p>
                <p className="mt-4 text-[15px] leading-[1.7] text-umber/75">
                  {seats} {seats === 1 ? "seat" : "seats"} on {dateLabel(sessions[session])}, 10:00–13:00 — {eur(seats * WORKSHOP_PRICE)}.
                  Everything is on the way to {wEmail}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBooked(false);
                    setWName("");
                    setWEmail("");
                  }}
                  className="mt-6 text-[13px] font-medium underline underline-offset-4"
                >
                  Book another session
                </button>
              </div>
            ) : (
              <form onSubmit={reserve} noValidate className="mt-12">
                <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-umber/55">Choose a Saturday</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {sessions.map((d, i) => {
                    const on = i === session;
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setSession(i);
                          setSeats((s) => Math.min(s, Math.min(4, SEATS[i])));
                        }}
                        data-cursor="grow"
                        className={`border px-3 py-3.5 text-left transition-colors duration-300 ${
                          on ? "border-umber bg-umber text-cream" : "border-umber/25 hover:border-umber"
                        }`}
                      >
                        <span className="block text-[15px] font-medium">{dateLabel(d)}</span>
                        <span className={`mt-1 block text-[12px] ${on ? "text-cream/70" : "text-umber/55"}`}>
                          {SEATS[i] === 1 ? "1 seat left" : `${SEATS[i]} seats left`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between border-y border-umber/20 py-5">
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-umber/55">Seats</p>
                    <div className="mt-2 flex items-center gap-4">
                      <button
                        type="button"
                        aria-label="Fewer seats"
                        onClick={() => setSeats((s) => Math.max(1, s - 1))}
                        className="grid h-9 w-9 place-items-center rounded-full border border-umber/30 transition-colors hover:bg-umber hover:text-cream"
                      >
                        −
                      </button>
                      <span className="num w-5 text-center text-[1.2rem] font-medium">{seats}</span>
                      <button
                        type="button"
                        aria-label="More seats"
                        onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))}
                        className="grid h-9 w-9 place-items-center rounded-full border border-umber/30 transition-colors hover:bg-umber hover:text-cream"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-umber/55">
                      {eur(WORKSHOP_PRICE)} each
                    </p>
                    <p className="num argile-soft mt-1 text-[2.4rem] font-light leading-none">{eur(seats * WORKSHOP_PRICE)}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-umber/55">Name</span>
                    <input
                      value={wName}
                      onChange={(e) => setWName(e.target.value)}
                      className="mt-1 w-full border-b border-umber/35 bg-transparent py-2.5 text-[16px] outline-none focus:border-terra"
                      placeholder="Camille Roux"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-umber/55">Email</span>
                    <input
                      type="email"
                      value={wEmail}
                      onChange={(e) => setWEmail(e.target.value)}
                      className="mt-1 w-full border-b border-umber/35 bg-transparent py-2.5 text-[16px] outline-none focus:border-terra"
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                {wErr && <p className="mt-3 text-[13px] text-terra">{wErr}</p>}
                <button
                  type="submit"
                  data-cursor="label"
                  data-cursor-label="Book"
                  className="mt-8 rounded-full bg-terra px-8 py-4 text-[14px] font-medium text-cream transition-colors duration-300 hover:bg-umber"
                >
                  Reserve {seats} {seats === 1 ? "seat" : "seats"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="overflow-hidden bg-umber px-5 pt-20 text-cream sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <p className="argile-soft max-w-[16ch] text-[clamp(1.8rem,3vw,2.6rem)] font-light italic leading-[1.1]">
                Letters from the kiln, twice a year.
              </p>
              {nlDone ? (
                <p className="mt-6 text-[14px] text-sand">Merci — the next firing will find you at {nl}.</p>
              ) : (
                <form
                  className="mt-6 flex max-w-[380px] border-b border-cream/40"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(nl)) setNlDone(true);
                  }}
                >
                  <input
                    type="email"
                    value={nl}
                    onChange={(e) => setNl(e.target.value)}
                    placeholder="Your email"
                    aria-label="Email for the newsletter"
                    className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-cream/35"
                  />
                  <button type="submit" className="px-2 text-[1.2rem] transition-transform hover:translate-x-1" aria-label="Subscribe">
                    →
                  </button>
                </form>
              )}
            </div>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-cream/45">Studio</p>
              <p className="mt-4 text-[15px] leading-relaxed text-cream/80">
                14 Rue Sainte
                <br />
                13001 Marseille
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-cream/45">Open</p>
              <p className="mt-4 text-[15px] leading-relaxed text-cream/80">
                Thursday — Saturday
                <br />
                11:00 — 18:00
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-cream/45">Write</p>
              <p className="mt-4 text-[15px] leading-relaxed text-cream/80">
                bonjour@argile.studio
                <br />
                Instagram · @argile.studio
              </p>
            </div>
          </div>
        </div>
        <p
          aria-hidden="true"
          className="argile-soft mt-10 select-none text-center font-light leading-[0.72] tracking-[-0.04em] text-terra"
          style={{ fontSize: "clamp(7rem, 30vw, 30rem)" }}
        >
          Argile
        </p>
      </footer>

      {/* ================= CART DRAWER ================= */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            data-modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[100] flex justify-end bg-umber/55 backdrop-blur-sm"
          >
            <motion.aside
              data-lenis-prevent
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.6, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-[460px] flex-col bg-cream p-6 text-umber sm:p-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="argile-soft text-[2rem] font-light leading-none">Your bag</h2>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  data-cursor="grow"
                  aria-label="Close bag"
                  className="grid h-10 w-10 place-items-center rounded-full border border-umber/25 text-[18px] transition-colors hover:bg-umber hover:text-cream"
                >
                  ×
                </button>
              </div>

              {order ? (
                <div className="mt-16">
                  <p className="argile-soft text-[2.6rem] font-light italic leading-[1.02]">Merci.</p>
                  <p className="mt-5 text-[15px] leading-[1.7] text-umber/75">
                    Your order is with the studio. Each piece is wrapped in paper and sent within three days.
                  </p>
                  <p className="mt-8 text-[12px] font-medium uppercase tracking-[0.18em] text-umber/50">Order {order}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrder(null);
                      setCartOpen(false);
                    }}
                    className="mt-8 rounded-full bg-umber px-6 py-3 text-[14px] font-medium text-cream"
                  >
                    Keep browsing
                  </button>
                </div>
              ) : lines.length === 0 ? (
                <div className="mt-16">
                  <p className="argile-soft text-[1.8rem] font-light italic leading-tight">Nothing in the bag yet.</p>
                  <a
                    href="#shop"
                    onClick={() => setCartOpen(false)}
                    className="mt-6 inline-block text-[14px] font-medium underline underline-offset-4"
                  >
                    See the current firing
                  </a>
                </div>
              ) : (
                <>
                  <div className="mt-8 rounded-full bg-sand p-4 text-[13px]">
                    <p className="text-center">
                      {toFree === 0 ? "Free shipping unlocked" : `${eur(toFree)} away from free shipping`}
                    </p>
                    <div className="mx-auto mt-2 h-1 max-w-[280px] overflow-hidden rounded-full bg-umber/15">
                      <motion.div
                        className="h-full origin-left rounded-full bg-terra"
                        animate={{ scaleX: Math.min(1, subtotal / SHIP_FREE) }}
                        transition={{ duration: 0.6, ease: EASE }}
                      />
                    </div>
                  </div>

                  <ul className="mt-6 flex-1 space-y-5 overflow-y-auto">
                    {lines.map(({ p, qty }) => (
                      <li key={p.id} className="grid grid-cols-[84px_1fr] gap-4">
                        <img src={p.img} alt={p.name} className="aspect-[4/5] w-full rounded-t-[999px] object-cover" />
                        <div className="flex flex-col justify-between py-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="argile-soft text-[1.15rem] font-light leading-tight">{p.name}</p>
                            <p className="num text-[14px] font-medium">{eur(p.price * qty)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                aria-label={`Fewer ${p.name}`}
                                onClick={() => setQty(p.id, qty - 1)}
                                className="grid h-7 w-7 place-items-center rounded-full border border-umber/30 text-[14px] transition-colors hover:bg-umber hover:text-cream"
                              >
                                −
                              </button>
                              <span className="num w-4 text-center text-[14px]">{qty}</span>
                              <button
                                type="button"
                                aria-label={`More ${p.name}`}
                                onClick={() => setQty(p.id, qty + 1)}
                                className="grid h-7 w-7 place-items-center rounded-full border border-umber/30 text-[14px] transition-colors hover:bg-umber hover:text-cream"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setQty(p.id, 0)}
                              className="text-[12px] text-umber/55 underline underline-offset-4 hover:text-terra"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2 border-t border-umber/20 pt-5 text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-umber/65">Subtotal</span>
                      <span className="num">{eur(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-umber/65">Shipping</span>
                      <span className="num">{shipping === 0 ? "Free" : eur(shipping)}</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-2">
                      <span className="argile-soft text-[1.3rem] font-light">Total</span>
                      <span className="num argile-soft text-[1.8rem] font-light">{eur(subtotal + shipping)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrder("AR-" + Date.now().toString(36).toUpperCase().slice(-5));
                      setCart({});
                    }}
                    data-cursor="label"
                    data-cursor-label="Pay"
                    className="mt-5 rounded-full bg-terra py-4 text-[14px] font-medium text-cream transition-colors duration-300 hover:bg-umber"
                  >
                    Place order · {eur(subtotal + shipping)}
                  </button>
                  <p className="mt-3 text-center text-[12px] text-umber/50">Demo checkout — no payment is taken.</p>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
