"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Globe,
  Plus,
  Play,
  CheckCircle2,
  TrendingUp,
  Inbox,
  ArrowRight,
} from "lucide-react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Import custom nodes from the builder for visual consistency in the preview
import { StartNode } from "@/components/builder/nodes/StartNode";
import { SubmitNode } from "@/components/builder/nodes/SubmitNode";
import { QuestionNode } from "@/components/builder/nodes/QuestionNode";

/* ─── Mock DB lookup by dynamic ID ─────────────────────────────────────── */
interface FormDetailsData {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  createdAt: string;
  updatedAt: string;
  totalQuestions: number;
  responseCount: number;
  completionRate: string;
}

const MOCK_FORMS_DB: Record<string, FormDetailsData> = {
  form_customer_feedback: {
    id: "form_customer_feedback",
    title: "Customer Satisfaction Survey",
    description: "Gather feedback from our Q2 product beta users about the UI revamp.",
    status: "published",
    createdAt: "2026-06-10T14:30:00Z",
    updatedAt: "2026-07-19T20:30:00Z",
    totalQuestions: 6,
    responseCount: 142,
    completionRate: "94.8%",
  },
  form_beta_signup: {
    id: "form_beta_signup",
    title: "Developer Beta Interest List",
    description: "Sign-up form for developers wanting access to our real-time synchronization API.",
    status: "draft",
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-07-18T16:45:00Z",
    totalQuestions: 4,
    responseCount: 0,
    completionRate: "0%",
  },
  form_hackathon_reg: {
    id: "form_hackathon_reg",
    title: "Summer Hackathon 2026 Registration",
    description: "Collect participant teams, tech stacks, and dietary details.",
    status: "published",
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-16T11:20:00Z",
    totalQuestions: 8,
    responseCount: 88,
    completionRate: "91.2%",
  },
  form_user_research: {
    id: "form_user_research",
    title: "User Experience Research Scheduling",
    description: "Qualifying questionnaire for booking 1-on-1 feedback sessions.",
    status: "closed",
    createdAt: "2026-05-20T08:15:00Z",
    updatedAt: "2026-07-05T14:10:00Z",
    totalQuestions: 5,
    responseCount: 312,
    completionRate: "89.5%",
  },
};

const DEFAULT_FORM: FormDetailsData = {
  id: "new_form",
  title: "Untitled Form",
  description: "Describe what this form is about...",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalQuestions: 2,
  responseCount: 0,
  completionRate: "0%",
};

/* ─── Mock Responses ─────────────────────────────────────────────────────── */
interface ResponseItem {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  answers: Record<string, string>;
}

const MOCK_RESPONSES: ResponseItem[] = [
  {
    id: "resp_1",
    name: "Alex Rivera",
    email: "alex@example.com",
    submittedAt: "2026-07-19T20:15:00Z",
    answers: {
      "What is your name?": "Alex Rivera",
      "Which features did you use most?": "Infinite Canvas, Custom Nodes",
      "Any feedback?": "Super fast, love the dark aesthetics!",
    },
  },
  {
    id: "resp_2",
    name: "Sarah Chen",
    email: "sarah.c@example.com",
    submittedAt: "2026-07-19T18:40:00Z",
    answers: {
      "What is your name?": "Sarah Chen",
      "Which features did you use most?": "Drag and Drop Builder",
      "Any feedback?": "The Figma-like controls are incredible.",
    },
  },
  {
    id: "resp_3",
    name: "Marcus Johnson",
    email: "marcus@example.com",
    submittedAt: "2026-07-19T15:22:00Z",
    answers: {
      "What is your name?": "Marcus Johnson",
      "Which features did you use most?": "Visual Flow Editor",
      "Any feedback?": "Highly developer-focused, fits perfectly in our workflow.",
    },
  },
];

/* ─── Read-only Flow Config ─────────────────────────────────────────────── */
import { type NodeTypes } from "@xyflow/react";

const previewNodeTypes: NodeTypes = {
  start: StartNode as unknown as NodeTypes[string],
  submit: SubmitNode as unknown as NodeTypes[string],
  question: QuestionNode as unknown as NodeTypes[string],
};

const previewNodes: Node[] = [
  {
    id: "p_start",
    type: "start",
    position: { x: 50, y: 110 },
    data: { label: "Start" },
    deletable: false,
  },
  {
    id: "p_q1",
    type: "question",
    position: { x: 230, y: 40 },
    data: {
      questionType: "text",
      title: "What is your email address?",
      description: "We'll send updates here.",
      required: true,
      options: [],
    },
    deletable: false,
  },
  {
    id: "p_submit",
    type: "submit",
    position: { x: 530, y: 110 },
    data: { label: "Submit" },
    deletable: false,
  },
];

const previewEdges: Edge[] = [
  { id: "e1", source: "p_start", target: "p_q1" },
  { id: "e2", source: "p_q1", target: "p_submit" },
];

export default function FormOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;

  const [form, setForm] = useState<FormDetailsData>(
    MOCK_FORMS_DB[formId] || { ...DEFAULT_FORM, id: formId }
  );

  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(null);

  const handlePublish = () => {
    setForm((prev) => ({ ...prev, status: "published" }));
    toast.success("Form is now published!", {
      description: "Public link is now active and accepting responses.",
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://blueprint.to/f/${form.id}`);
    toast.success("Link copied to clipboard", {
      description: "Send this URL to your respondents.",
    });
  };

  const handlePreview = () => {
    toast.info("Entering Preview Mode...", {
      description: "Preview renders the live form layout.",
    });
  };

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ─── Left Section: Form Information & Visual Preview ──────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Form Information */}
        <Card className="p-5 bg-card border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-3">Form Information</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {form.description || "No description provided."}
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Created</span>
                <span className="text-foreground font-medium">
                  {new Date(form.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Last Updated</span>
                <span className="text-foreground font-medium">
                  {new Date(form.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Visual Flow Preview (Read Only) */}
        <Card className="bg-card border border-border overflow-hidden flex flex-col min-h-[340px]">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Visual Flow Preview</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Read-only interactive view</p>
            </div>
            <Badge variant="muted" className="text-[10px]">Read Only</Badge>
          </div>
          <div className="flex-1 bg-background relative" style={{ minHeight: "260px" }}>
            <ReactFlow
              nodes={previewNodes}
              edges={previewEdges}
              nodeTypes={previewNodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={true}
              nodesConnectable={false}
              nodesFocusable={false}
              edgesFocusable={false}
              elementsSelectable={true}
              panOnDrag={true}
              zoomOnScroll={true}
              preventScrolling={true}
              proOptions={proOptions}
              className="bg-background"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={16}
                size={1}
                color="hsl(222 25% 15%)"
              />
              <Controls showInteractive={false} position="bottom-left" />
            </ReactFlow>
          </div>
        </Card>
      </div>

      {/* ─── Right Section: Quick Stats, Responses, Actions ────────────────── */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card className="p-5 bg-card border border-border space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Quick Actions</h3>
          <div className="grid gap-2">
            <Button
              size="sm"
              className="w-full text-xs font-semibold h-8.5 gap-2"
              onClick={() => router.push(`/forms/${form.id}/builder`)}
            >
              Open Builder <ArrowRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8.5 gap-2 border-border"
              onClick={handleCopyLink}
            >
              <Copy className="h-3.5 w-3.5" /> Copy Public Link
            </Button>
            {form.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8.5 gap-2 border-primary/20 text-primary hover:bg-primary/5"
                onClick={handlePublish}
              >
                <Globe className="h-3.5 w-3.5" /> Publish Form
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Statistics */}
        <Card className="p-5 bg-card border border-border space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Form Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border/50 bg-muted/10 rounded-lg p-3 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Questions</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{form.totalQuestions}</span>
            </div>
            <div className="border border-border/50 bg-muted/10 rounded-lg p-3 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Submissions</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{form.responseCount}</span>
            </div>
            <div className="border border-border/50 bg-muted/10 rounded-lg p-3 text-center col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Completion Rate</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{form.completionRate}</span>
            </div>
          </div>
        </Card>

        {/* Recent Responses */}
        <Card className="p-5 bg-card border border-border space-y-3.5">
          <h3 className="font-semibold text-foreground text-sm">Recent Responses</h3>
          {MOCK_RESPONSES.length > 0 ? (
            <div className="space-y-3">
              {MOCK_RESPONSES.map((resp) => (
                <div key={resp.id} className="flex items-center justify-between gap-2 p-2 border border-border/40 rounded-lg bg-muted/5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{resp.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {new Date(resp.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] px-2 text-primary hover:bg-primary/10"
                    onClick={() => setSelectedResponse(resp)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No responses yet.</p>
          )}
        </Card>
      </div>

      {/* Response inspect modal */}
      <Dialog open={selectedResponse !== null} onOpenChange={(open) => !open && setSelectedResponse(null)}>
        <DialogContent className="max-w-md">
          {selectedResponse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm">Response Details</DialogTitle>
                <DialogDescription className="text-xs">
                  Submitted by {selectedResponse.name} ({selectedResponse.email}) on{" "}
                  {new Date(selectedResponse.submittedAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="space-y-4 py-2 text-left">
                {Object.entries(selectedResponse.answers).map(([question, answer]) => (
                  <div key={question} className="space-y-1">
                    <p className="text-xs font-semibold text-foreground/80">{question}</p>
                    <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5">
                      <p className="text-xs text-foreground leading-relaxed">{answer}</p>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button size="sm" className="h-8 text-xs font-semibold" onClick={() => setSelectedResponse(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
