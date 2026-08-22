import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  Sparkles,
  CheckCircle2,
  Layers,
  Share2,
  BarChart2,
  FileCode2,
  PenTool,
  Compass,
  Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlueprintLogo } from "@/components/brand/BlueprintLogo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-x-hidden">
      {/* Hand-Drawn Blueprint Paper Background Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
         1. TOP NAVIGATION BAR — Hand-Drawn Ink Style
         ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-[hsl(var(--foreground))] bg-white/95 backdrop-blur-md shadow-[0_2px_0_0_hsl(var(--foreground))]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <BlueprintLogo showText={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-700 font-bold">
            <a href="#canvas" className="hover:text-[hsl(var(--primary))] transition-colors">// CANVAS</a>
            <a href="#features" className="hover:text-[hsl(var(--primary))] transition-colors">// FEATURES</a>
            <a href="#architecture" className="hover:text-[hsl(var(--primary))] transition-colors">// SPECIFICATION</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-xs font-bold font-mono">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="h-9 px-4 text-xs font-bold gap-1.5 font-mono">
                Get Started <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         2. HERO SECTION WITH HAND-DRAWN DOODLE THESIS
         ───────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-14 pb-12 text-center md:pt-20 md:pb-16">
        <div className="inline-flex items-center gap-2 rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] px-3.5 py-1 text-xs font-mono font-bold text-[hsl(var(--primary))] shadow-[2px_2.5px_0px_0px_hsl(var(--foreground))] mb-6 -rotate-1">
          <PenTool className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
          <span>HAND-DRAWN VISUAL ENGINE // NEXT.JS 16 & REACT FLOW</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.15] font-doodle text-[hsl(var(--foreground))]">
          Build intelligent forms that <span className="text-[hsl(var(--primary))] underline decoration-wavy decoration-[hsl(var(--primary))/0.5] underline-offset-8">think in flows</span>, not static fields.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-700 leading-relaxed sm:text-lg font-medium">
          Compose step-by-step conversational experiences on an infinite visual node graph. Validate graph flow in real time, publish instant public share links, and inspect responder answers.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-7 text-sm font-extrabold gap-2 font-mono">
              Start Building Free <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-bold font-mono">
              Explore Live Demo
            </Button>
          </Link>
        </div>

        {/* Hand-Drawn Doodle Pill Guarantees */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-700 font-bold">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-[hsl(var(--foreground))] bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Zero Lock-in Graph JSON
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-[hsl(var(--foreground))] bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Real-time Autosave & Preview
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-[hsl(var(--foreground))] bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Instant Public Links (`frm_*`)
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         3. VISUAL HAND-DRAWN NODE CANVAS SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <section id="canvas" className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="relative rounded-2xl border-3 border-[hsl(var(--foreground))] bg-white p-3 shadow-[6px_8px_0px_0px_hsl(var(--foreground))] overflow-hidden">
          {/* Mock Canvas Header */}
          <div className="flex items-center justify-between border-b-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] px-4 py-3 font-mono text-xs rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--primary))]" />
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--foreground))] bg-white" />
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))]" />
              <span className="ml-2 font-bold text-[hsl(var(--foreground))]">[CANVAS // DEMO_SURVEY.GRPH]</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">
                Graph Validated
              </Badge>
              <span className="text-[10px] text-slate-600 font-mono font-bold">100% ZOOM</span>
            </div>
          </div>

          {/* Node Graph Mock Viewport (Sketch Paper) */}
          <div
            className="relative min-h-95 md:min-h-115 bg-white p-6 md:p-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
            }}
          >
            {/* Connected Node 1: Start Node */}
            <div className="w-64 rounded-xl border-2 border-[hsl(var(--foreground))] bg-white p-4 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] relative z-10 transition-all hover:scale-[1.02] -rotate-1">
              <div className="flex items-center justify-between border-b-2 border-[hsl(var(--foreground))/0.15] pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--primary))]">NODE #01 // START</span>
                <span className="text-slate-500 font-bold">ENTRY</span>
              </div>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] font-mono">Email Collection</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug font-sans">"What's your primary email address?"</p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-600 border-t-2 border-[hsl(var(--foreground))/0.1] pt-2">
                <span>Type: Email</span>
                <span className="text-[hsl(var(--primary))] font-bold">Required</span>
              </div>
            </div>

            {/* Connecting Line 1 */}
            <div className="hidden md:flex items-center justify-center text-[hsl(var(--primary))]">
              <div className="w-12 h-0.5 bg-[hsl(var(--primary))] border-b-2 border-dashed border-[hsl(var(--primary))]" />
              <ArrowRight className="h-5 w-5 -ml-1 text-[hsl(var(--primary))]" />
            </div>

            {/* Connected Node 2: Choice Question */}
            <div className="w-64 rounded-xl border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] p-4 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] relative z-10 transition-all hover:scale-[1.02] rotate-1">
              <div className="flex items-center justify-between border-b-2 border-[hsl(var(--foreground))/0.15] pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--primary))]">NODE #02 // CHOICE</span>
                <span className="text-slate-500 font-bold">RADIO</span>
              </div>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] font-mono">Satisfaction Rating</p>
              <div className="mt-2 space-y-1">
                <div className="p-1.5 rounded-sm border border-[hsl(var(--foreground))] bg-white text-[10px] font-mono font-bold text-[hsl(var(--primary))]">1. Extremely Satisfied</div>
                <div className="p-1.5 rounded-sm border border-slate-300 bg-white text-[10px] font-mono text-slate-600">2. Neutral</div>
              </div>
            </div>

            {/* Connecting Line 2 */}
            <div className="hidden md:flex items-center justify-center text-[hsl(var(--primary))]">
              <div className="w-12 h-0.5 bg-[hsl(var(--primary))] border-b-2 border-dashed border-[hsl(var(--primary))]" />
              <ArrowRight className="h-5 w-5 -ml-1 text-[hsl(var(--primary))]" />
            </div>

            {/* Connected Node 3: Submit Node */}
            <div className="w-64 rounded-xl border-2 border-[hsl(var(--foreground))] bg-white p-4 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] relative z-10 transition-all hover:scale-[1.02] rotate-[-0.5deg]">
              <div className="flex items-center justify-between border-b-2 border-[hsl(var(--foreground))/0.15] pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--primary))]">NODE #03 // SUBMIT</span>
                <span className="text-slate-500 font-bold">END</span>
              </div>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] font-mono">Record Submission</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug font-sans">Writes answer rows inside PostgreSQL Drizzle transaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         4. FEATURE HIGHLIGHTS GRID
         ───────────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-doodle text-base font-bold text-[hsl(var(--primary))]">
            // DESIGNED FOR SPEED & PRECISION
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--foreground))] mt-1 sm:text-4xl font-doodle">
            Everything you need to build thoughtful forms.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
              <Layers className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Visual Canvas Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Drag and drop nodes on an infinite canvas. Add questions, format choices, and configure step-by-step logic.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
              <Share2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Instant Share Links</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Publish forms instantly with safe public `frm_*` identifiers. Distribute share links to responders effortlessly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
              <BarChart2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Responses Carousel</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Inspect submissions in a default tabular view or slide through individual questions with left/right carousel arrows.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         5. TECHNICAL SPECIFICATION ARCHITECTURE
         ───────────────────────────────────────────────────────────── */}
      <section id="architecture" className="mx-auto max-w-7xl px-6 py-12 border-t-2 border-[hsl(var(--foreground))]">
        <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-8 shadow-[5px_6px_0px_0px_hsl(var(--foreground))]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="font-mono text-xs font-bold uppercase text-[hsl(var(--primary))]">
                  TECH STACK SPECIFICATION
                </span>
              </div>
              <h3 className="text-2xl font-bold font-doodle text-[hsl(var(--foreground))] mt-1">Monorepo Built on Next.js 16 & Express 5</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed font-sans font-medium">
                Powered by Turborepo, Drizzle ORM, Neon PostgreSQL, React Flow, `@dnd-kit`, and Blueprint Blue hand-inked design tokens.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Badge variant="outline" className="font-mono text-xs py-1">Next.js 16</Badge>
              <Badge variant="outline" className="font-mono text-xs py-1">React 19</Badge>
              <Badge variant="outline" className="font-mono text-xs py-1">Express 5</Badge>
              <Badge variant="outline" className="font-mono text-xs py-1">Drizzle ORM</Badge>
              <Badge variant="outline" className="font-mono text-xs py-1">Neon DB</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         6. BOTTOM FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="border-t-2 border-[hsl(var(--foreground))] bg-white py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-slate-700 font-mono font-bold">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span>BLUEPRINT FORMS © {new Date().getFullYear()}</span>
          </div>
          <div>HAND-INKED WITH GOOGLE ANTIGRAVITY</div>
        </div>
      </footer>
    </div>
  );
}
