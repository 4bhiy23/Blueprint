import Link from "next/link";
import { 
  ArrowRight, 
  LayoutGrid, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Share2, 
  BarChart2, 
  ShieldCheck, 
  MousePointerClick,
  FileCode2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Catppuccin Mocha Background Canvas Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
         1. TOP NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] shadow-md group-hover:scale-105 transition-transform">
              <LayoutGrid className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="font-mono text-base font-black tracking-wider text-foreground">
              BLUEPRINT
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-muted-foreground font-semibold">
            <a href="#features" className="hover:text-[hsl(var(--mocha-mauve))] transition-colors">FEATURES</a>
            <a href="#canvas" className="hover:text-[hsl(var(--mocha-mauve))] transition-colors">NODE ENGINE</a>
            <a href="#architecture" className="hover:text-[hsl(var(--mocha-mauve))] transition-colors">SPECIFICATION</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-xs font-bold hover:bg-secondary/60">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="h-9 px-4 text-xs font-bold gap-1.5 bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] hover:bg-[hsl(var(--mocha-mauve))/0.9] shadow-md transition-all">
                Get Started <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         2. HERO SECTION WITH THESIS & CALL TO ACTIONS
         ───────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 text-center md:pt-24 md:pb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--mocha-mauve))/0.3] bg-[hsl(var(--mocha-mauve))/0.1] px-3.5 py-1 text-xs font-mono font-bold text-[hsl(var(--mocha-mauve))] mb-6 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>VISUAL FORM ENGINE // NEXT.JS 16 & REACT FLOW</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.1]">
          Build intelligent forms that <span className="text-[hsl(var(--mocha-mauve))] underline decoration-[hsl(var(--mocha-mauve))/0.4] underline-offset-8">think in flows</span>, not static fields.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
          Compose step-by-step conversational experiences on an infinite visual node graph. Validate graph flow in real time, publish instant public links, and inspect respondent submissions.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-7 text-sm font-extrabold gap-2 bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] hover:bg-[hsl(var(--mocha-mauve))/0.9] shadow-xl transition-all w-full sm:w-auto">
              Start Building Free <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-bold border-border bg-card hover:bg-secondary/60 text-foreground w-full sm:w-auto">
              Explore Live Demo
            </Button>
          </Link>
        </div>

        {/* Feature Pill Tags */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-foreground font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--mocha-green))]" /> Zero Lock-in Graph JSON
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--mocha-teal))]" /> Real-time Autosave & Preview
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--mocha-sapphire))]" /> Instant Public Links (`frm_*`)
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         3. VISUAL INTERACTIVE NODE CANVAS SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <section id="canvas" className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="relative rounded-2xl border border-border bg-card p-3 shadow-2xl overflow-hidden">
          {/* Mock Canvas Header */}
          <div className="flex items-center justify-between border-b border-border/80 bg-secondary/30 px-4 py-3 rounded-t-xl font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--mocha-red))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--mocha-yellow))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--mocha-green))]" />
              <span className="ml-2 font-bold text-muted-foreground">[CANVAS // DEMO_CUSTOMER_SURVEY.GRPH]</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[9px] font-mono uppercase">
                Graph Validated
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">100% ZOOM</span>
            </div>
          </div>

          {/* Node Graph Mock Viewport */}
          <div 
            className="relative min-h-95 md:min-h-115 bg-background p-6 md:p-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "center"
            }}
          >
            {/* Connected Node 1: Start Node */}
            <div className="w-64 rounded-xl border border-[hsl(var(--mocha-mauve))] bg-card p-4 shadow-xl relative z-10 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--mocha-mauve))]">NODE #01 // START</span>
                <span className="text-muted-foreground">ENTRY</span>
              </div>
              <p className="text-xs font-bold text-foreground">Welcome & Email Collection</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">"What's your primary email address?"</p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t border-border/50 pt-2">
                <span>Type: Email</span>
                <span className="text-[hsl(var(--mocha-green))]">Required</span>
              </div>
            </div>

            {/* Connecting Line 1 */}
            <div className="hidden md:flex items-center justify-center text-[hsl(var(--mocha-mauve))]">
              <div className="w-12 h-0.5 bg-linear-to-r from-[hsl(var(--mocha-mauve))] to-[hsl(var(--mocha-teal))]" />
              <ArrowRight className="h-4 w-4 -ml-1 text-[hsl(var(--mocha-teal))]" />
            </div>

            {/* Connected Node 2: Choice Question */}
            <div className="w-64 rounded-xl border border-[hsl(var(--mocha-teal))] bg-card p-4 shadow-xl relative z-10 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--mocha-teal))]">NODE #02 // CHOICE</span>
                <span className="text-muted-foreground">RADIO</span>
              </div>
              <p className="text-xs font-bold text-foreground">Product Satisfaction Rating</p>
              <div className="mt-2 space-y-1">
                <div className="p-1.5 rounded bg-secondary/50 text-[10px] font-mono text-foreground">1. Extremely Satisfied</div>
                <div className="p-1.5 rounded bg-secondary/30 text-[10px] font-mono text-muted-foreground">2. Neutral</div>
              </div>
            </div>

            {/* Connecting Line 2 */}
            <div className="hidden md:flex items-center justify-center text-[hsl(var(--mocha-teal))]">
              <div className="w-12 h-0.5 bg-linear-to-r from-[hsl(var(--mocha-teal))] to-[hsl(var(--mocha-sapphire))]" />
              <ArrowRight className="h-4 w-4 -ml-1 text-[hsl(var(--mocha-sapphire))]" />
            </div>

            {/* Connected Node 3: Submit Node */}
            <div className="w-64 rounded-xl border border-[hsl(var(--mocha-sapphire))] bg-card p-4 shadow-xl relative z-10 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--mocha-sapphire))]">NODE #03 // SUBMIT</span>
                <span className="text-muted-foreground">END</span>
              </div>
              <p className="text-xs font-bold text-foreground">Record Submission</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">Writes answer rows inside PostgreSQL Drizzle transaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         4. FEATURE HIGHLIGHTS GRID
         ───────────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[hsl(var(--mocha-mauve))]">
            // DESIGNED FOR SPEED & PRECISION
          </p>
          <h2 className="text-3xl font-black tracking-tight text-foreground mt-2 sm:text-4xl">
            Everything you need to build portfolio-grade forms.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--mocha-mauve))/0.15] text-[hsl(var(--mocha-mauve))] border border-[hsl(var(--mocha-mauve))/0.3]">
              <Layers className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-foreground">Visual Canvas Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag and drop nodes on a React Flow canvas. Add questions, format choices, and configure validation rules effortlessly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--mocha-teal))/0.15] text-[hsl(var(--mocha-teal))] border border-[hsl(var(--mocha-teal))/0.3]">
              <Share2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-foreground">Instant Share Links</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Publish forms instantly with safe, public `frm_*` identifiers. Distribute links to users without exposing internal backend database UUIDs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--mocha-sapphire))/0.15] text-[hsl(var(--mocha-sapphire))] border border-[hsl(var(--mocha-sapphire))/0.3]">
              <BarChart2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-foreground">Responses & Carousel View</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inspect submissions in a default tabular view or slide through individual questions with left/right carousel arrows to analyze responder answers.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         5. TECHNICAL SPECIFICATION ARCHITECTURE
         ───────────────────────────────────────────────────────────── */}
      <section id="architecture" className="mx-auto max-w-7xl px-6 py-12 border-t border-border/80">
        <div className="rounded-2xl border border-border bg-card/60 p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[hsl(var(--mocha-mauve))]" />
                <span className="font-mono text-xs font-bold uppercase text-[hsl(var(--mocha-mauve))]">
                  TECH STACK SPECIFICATION
                </span>
              </div>
              <h3 className="text-2xl font-black text-foreground mt-2">Monorepo Built on Next.js 16 & Express 5</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                Powered by Turborepo, Drizzle ORM, Neon PostgreSQL, React Flow, `@dnd-kit`, and Catppuccin Mocha styling tokens.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Badge variant="muted" className="font-mono text-xs py-1">Next.js 16</Badge>
              <Badge variant="muted" className="font-mono text-xs py-1">React 19</Badge>
              <Badge variant="muted" className="font-mono text-xs py-1">Express 5</Badge>
              <Badge variant="muted" className="font-mono text-xs py-1">Drizzle ORM</Badge>
              <Badge variant="muted" className="font-mono text-xs py-1">Neon DB</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         6. BOTTOM FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[hsl(var(--mocha-mauve))]" />
            <span>BLUEPRINT FORMS © {new Date().getFullYear()}</span>
          </div>
          <div>POWERED BY GOOGLE ANTIGRAVITY</div>
        </div>
      </footer>
    </div>
  );
}

