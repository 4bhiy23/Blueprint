import Link from "next/link";
import { 
  ArrowRight, 
  Layers, 
  Share2, 
  BarChart2, 
  CheckCircle2, 
  Sliders, 
  PenTool, 
  GitBranch, 
  Users, 
  Target, 
  Sparkles,
  MessageSquareText,
  UserCheck,
  Calendar,
  Zap
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
         TOP NAVIGATION BAR — Hand-Drawn Ink Style
         ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-[hsl(var(--foreground))] bg-white/95 backdrop-blur-md shadow-[0_2px_0_0_hsl(var(--foreground))]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <BlueprintLogo showText={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-700 font-bold">
            <a href="#visual-demo" className="hover:text-[hsl(var(--primary))] transition-colors">// BUILDER</a>
            <a href="#how-it-works" className="hover:text-[hsl(var(--primary))] transition-colors">// HOW IT WORKS</a>
            <a href="#features" className="hover:text-[hsl(var(--primary))] transition-colors">// FEATURES</a>
            <a href="#use-cases" className="hover:text-[hsl(var(--primary))] transition-colors">// USE CASES</a>
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
         1. HERO SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-14 pb-12 text-center md:pt-20 md:pb-16">
        <div className="inline-flex items-center gap-2 rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] px-3.5 py-1 text-xs font-mono font-bold text-[hsl(var(--primary))] shadow-[2px_2.5px_0px_0px_hsl(var(--foreground))] mb-6 rotate-[-1deg]">
          <PenTool className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
          <span>VISUAL FORM BUILDER FOR ADAPTIVE EXPERIENCES</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.15] font-doodle text-[hsl(var(--foreground))]">
          Build forms that <span className="text-[hsl(var(--primary))] underline decoration-wavy decoration-[hsl(var(--primary))/0.5] underline-offset-8">think in flows</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-700 leading-relaxed sm:text-lg font-medium">
          A visual form builder for adaptive, multi-step experiences. Compose questions, condition logic, and validation rules on an interactive graph canvas.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-7 text-sm font-extrabold gap-2 font-mono">
              Start Building Free <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </Link>
          <a href="#visual-demo">
            <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-bold font-mono">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Concise Benefit Row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs font-mono text-slate-700 font-bold">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-[hsl(var(--foreground))] bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Visual Flow Builder
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-[hsl(var(--foreground))] bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Instant Public Links
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-[hsl(var(--foreground))] bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Response Insights
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         2. PRODUCT VISUAL — ANNOTATED HAND-DRAWN MOCK
         ───────────────────────────────────────────────────────────── */}
      <section id="visual-demo" className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="relative rounded-2xl border-3 border-[hsl(var(--foreground))] bg-white p-3 shadow-[8px_10px_0px_0px_hsl(var(--foreground))] overflow-hidden">
          {/* Mock Builder Header */}
          <div className="flex items-center justify-between border-b-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] px-4 py-3 font-mono text-xs rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--primary))]" />
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--foreground))] bg-white" />
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))]" />
              <span className="ml-2 font-bold text-[hsl(var(--foreground))]">[BLUEPRINT BUILDER // CUSTOMER_FEEDBACK.FLOW]</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">
                Graph Validated
              </Badge>
              <span className="text-[10px] text-slate-600 font-mono font-bold">100% CANVAS</span>
            </div>
          </div>

          {/* Node Graph Mock Viewport */}
          <div 
            className="relative min-h-110 md:min-h-125 bg-white p-6 md:p-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
            }}
          >
            {/* Callout Annotation 1: Question Nodes */}
            <div className="absolute top-4 left-6 z-20 hidden lg:flex items-center gap-2 bg-[hsl(var(--blueprint-wash))] border-2 border-[hsl(var(--foreground))] px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_hsl(var(--foreground))] rotate-[-2deg]">
              <PenTool className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              <span className="text-[11px] font-doodle font-bold text-[hsl(var(--foreground))]">✍️ Question Nodes (Text, Radio, Rating)</span>
            </div>

            {/* Callout Annotation 2: Validation & Branching */}
            <div className="absolute bottom-4 left-1/3 z-20 hidden lg:flex items-center gap-2 bg-white border-2 border-[hsl(var(--foreground))] px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_hsl(var(--foreground))] rotate-[1.5deg]">
              <GitBranch className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              <span className="text-[11px] font-doodle font-bold text-[hsl(var(--foreground))]">⚡ Branching Logic & Real-time Validation</span>
            </div>

            {/* Callout Annotation 3: Publishing */}
            <div className="absolute top-4 right-6 z-20 hidden lg:flex items-center gap-2 bg-[hsl(var(--blueprint-wash))] border-2 border-[hsl(var(--foreground))] px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_hsl(var(--foreground))] rotate-[1deg]">
              <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              <span className="text-[11px] font-doodle font-bold text-[hsl(var(--foreground))]">🚀 Instant `frm_*` Public Link</span>
            </div>

            {/* Connected Node 1: Start Node */}
            <div className="w-64 rounded-xl border-2 border-[hsl(var(--foreground))] bg-white p-4 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] relative z-10 transition-all hover:scale-[1.02] rotate-[-1deg]">
              <div className="flex items-center justify-between border-b-2 border-[hsl(var(--foreground))/0.15] pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--primary))]">NODE #01 // START</span>
                <span className="text-slate-500 font-bold">EMAIL</span>
              </div>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] font-mono">Responder Identification</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug font-sans">"What's your primary work email address?"</p>
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
            <div className="w-64 rounded-xl border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] p-4 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] relative z-10 transition-all hover:scale-[1.02] rotate-[1deg]">
              <div className="flex items-center justify-between border-b-2 border-[hsl(var(--foreground))/0.15] pb-2 mb-2 font-mono text-[10px]">
                <span className="font-bold text-[hsl(var(--primary))]">NODE #02 // CHOICE</span>
                <span className="text-slate-500 font-bold">RADIO</span>
              </div>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] font-mono">Product Satisfaction</p>
              <div className="mt-2 space-y-1">
                <div className="p-1.5 rounded border border-[hsl(var(--foreground))] bg-white text-[10px] font-mono font-bold text-[hsl(var(--primary))]">1. Extremely Satisfied</div>
                <div className="p-1.5 rounded border border-slate-300 bg-white text-[10px] font-mono text-slate-600">2. Needs Improvement</div>
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
              <p className="text-[11px] text-slate-600 mt-1 leading-snug font-sans">Stores answers into Neon PostgreSQL with completion timing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         3. HOW IT WORKS
         ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16 border-t-2 border-[hsl(var(--foreground))/0.15]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-doodle text-base font-bold text-[hsl(var(--primary))]">
            // SIMPLE THREE-STEP WORKFLOW
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--foreground))] mt-1 sm:text-4xl font-doodle">
            How Blueprint Works
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Step 1 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[5px_6px_0px_0px_hsl(var(--foreground))] relative rotate-[-0.8deg]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] font-mono font-bold text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] mb-4">
              01
            </div>
            <h3 className="text-xl font-bold font-doodle text-[hsl(var(--foreground))] mb-2">Map Your Question Flow</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Drag and connect question nodes on the canvas. Configure choices, input validation, and step-by-step logic.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[5px_6px_0px_0px_hsl(var(--foreground))] relative rotate-[0.6deg]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] font-mono font-bold text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] mb-4">
              02
            </div>
            <h3 className="text-xl font-bold font-doodle text-[hsl(var(--foreground))] mb-2">Publish a Shareable Form</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Click publish to generate a secure public link (`frm_*`). Share it with respondents across web or email.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[5px_6px_0px_0px_hsl(var(--foreground))] relative rotate-[-0.4deg]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] font-mono font-bold text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] mb-4">
              03
            </div>
            <h3 className="text-xl font-bold font-doodle text-[hsl(var(--foreground))] mb-2">Review Responses & Improve</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Inspect answer submissions in tabular view or slide through per-question carousel cards to gather feedback.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         4. CORE FEATURE SECTIONS
         ───────────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 border-t-2 border-[hsl(var(--foreground))/0.15]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-doodle text-base font-bold text-[hsl(var(--primary))]">
            // CAPABILITIES
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--foreground))] mt-1 sm:text-4xl font-doodle">
            Built for visual clarity and complete control.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Feature 1: Visual Flow Builder */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[5px_6px_0px_0px_hsl(var(--foreground))] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <Layers className="h-5 w-5 stroke-[2.5]" />
              </div>
              <Badge variant="success">Live</Badge>
            </div>
            <h3 className="text-xl font-bold font-doodle text-[hsl(var(--foreground))]">Visual Flow Builder</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Compose conversational forms on an infinite React Flow node canvas. Add questions, format choices, and validate flow logic before publishing.
            </p>
          </div>

          {/* Feature 2: Form Controls */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[5px_6px_0px_0px_hsl(var(--foreground))] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <Sliders className="h-5 w-5 stroke-[2.5]" />
              </div>
              <Badge variant="success">Live</Badge>
            </div>
            <h3 className="text-xl font-bold font-doodle text-[hsl(var(--foreground))]">Form Availability Controls</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Configure opening/closing schedules, set maximum response limits, and enforce single-response rules per responder.
            </p>
          </div>

          {/* Feature 3: Instant Public Links */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[5px_6px_0px_0px_hsl(var(--foreground))] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <Share2 className="h-5 w-5 stroke-[2.5]" />
              </div>
              <Badge variant="success">Live</Badge>
            </div>
            <h3 className="text-xl font-bold font-doodle text-[hsl(var(--foreground))]">Instant Public Links</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Publish forms with safe public `frm_*` identifiers. Distribute share links instantly without exposing internal backend database UUIDs.
            </p>
          </div>

          {/* Feature 4: Response Collection & Analytics */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-6 shadow-[5px_6px_0px_0px_hsl(var(--foreground))] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <BarChart2 className="h-5 w-5 stroke-[2.5]" />
              </div>
              <Badge variant="outline" className="font-mono text-[9px] uppercase">
                Analytics Coming Soon
              </Badge>
            </div>
            <h3 className="text-xl font-bold font-doodle text-[hsl(var(--foreground))]">Response Collection & Carousel</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Inspect answer submissions in tabular view or slide through per-question carousel cards. Deep analytical charts and completion drop-off metrics coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         5. USE CASES
         ───────────────────────────────────────────────────────────── */}
      <section id="use-cases" className="mx-auto max-w-7xl px-6 py-16 border-t-2 border-[hsl(var(--foreground))/0.15]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-doodle text-base font-bold text-[hsl(var(--primary))]">
            // APPLICATIONS
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--foreground))] mt-1 sm:text-4xl font-doodle">
            Built for every conversational flow.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Use Case 1 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-5 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-2">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] font-mono font-bold text-xs">
              <MessageSquareText className="h-4 w-4" />
              <span>CUSTOMER FEEDBACK</span>
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Customer Feedback</h3>
            <p className="text-xs text-slate-600 font-sans font-medium leading-relaxed">
              Collect product reviews, satisfaction ratings, and feature requests with step-by-step follow-up questions.
            </p>
          </div>

          {/* Use Case 2 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-5 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-2">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] font-mono font-bold text-xs">
              <UserCheck className="h-4 w-4" />
              <span>LEAD QUALIFICATION</span>
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Lead Qualification</h3>
            <p className="text-xs text-slate-600 font-sans font-medium leading-relaxed">
              Screen inbound leads by budget, company size, and project scope before routing to sales teams.
            </p>
          </div>

          {/* Use Case 3 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-5 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-2">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] font-mono font-bold text-xs">
              <Target className="h-4 w-4" />
              <span>PRODUCT RESEARCH</span>
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Product Research</h3>
            <p className="text-xs text-slate-600 font-sans font-medium leading-relaxed">
              Run user research surveys to evaluate new feature ideas, usability friction, and customer persona data.
            </p>
          </div>

          {/* Use Case 4 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-5 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-2">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] font-mono font-bold text-xs">
              <Users className="h-4 w-4" />
              <span>TEAM INTAKE & REQUESTS</span>
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Team Intake & Requests</h3>
            <p className="text-xs text-slate-600 font-sans font-medium leading-relaxed">
              Standardize internal design requests, IT support tickets, and bug reports across your organization.
            </p>
          </div>

          {/* Use Case 5 */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white p-5 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-2">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] font-mono font-bold text-xs">
              <Calendar className="h-4 w-4" />
              <span>EVENT REGISTRATION</span>
            </div>
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Event Registration</h3>
            <p className="text-xs text-slate-600 font-sans font-medium leading-relaxed">
              Gather attendee RSVPs, workshop preferences, and dietary requirements with total response cap controls.
            </p>
          </div>

          {/* Extra use case callout */}
          <div className="rounded-2xl border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] p-5 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex flex-col justify-center text-center">
            <Sparkles className="h-6 w-6 text-[hsl(var(--primary))] mx-auto mb-2" />
            <h3 className="text-lg font-bold font-doodle text-[hsl(var(--foreground))]">Your Custom Flow</h3>
            <p className="text-xs text-slate-600 font-sans font-medium mt-1">
              Build any custom branching flow on our node canvas in under 5 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         6. FINAL CALL TO ACTION
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border-3 border-[hsl(var(--foreground))] bg-white p-8 md:p-12 shadow-[8px_10px_0px_0px_hsl(var(--foreground))] text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--blueprint-wash))] px-3.5 py-1 text-xs font-mono font-bold text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>READY TO BUILD?</span>
          </div>

          <h2 className="text-3xl font-black font-doodle text-[hsl(var(--foreground))] sm:text-5xl">
            Create your first flow today.
          </h2>

          <p className="mx-auto max-w-xl text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Join developers and product teams building adaptive conversational forms visually.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 px-8 text-sm font-extrabold gap-2 font-mono">
                Get Started Free <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-bold font-mono">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         7. BLUEPRINT FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="overflow-hidden border-t-3 border-[hsl(var(--foreground))] bg-[hsl(var(--background))] px-3 pb-4 pt-8 text-center sm:px-6 sm:pt-12">
        <span className="block select-none whitespace-nowrap font-doodle text-[clamp(4.5rem,18.5vw,18rem)] font-black leading-[0.78] tracking-[-0.055em] text-[hsl(var(--primary))]">
          BLUEPRINT
        </span>
      </footer>
    </div>
  );
}
