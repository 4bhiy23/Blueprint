"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DetailedResponse {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  status: "completed" | "in-progress";
  answers: {
    question: string;
    answer: string;
  }[];
}

const RESPONSE_DB: Record<string, DetailedResponse> = {
  resp_1: {
    id: "resp_1",
    name: "Alex Rivera",
    email: "alex@example.com",
    submittedAt: "2026-07-19T20:15:00Z",
    status: "completed",
    answers: [
      { question: "What is your name?", answer: "Alex Rivera" },
      { question: "What is your email address?", answer: "alex@example.com" },
      { question: "Which features did you use most?", answer: "Infinite Canvas, Custom Nodes" },
      { question: "Any feedback?", answer: "Super fast, love the dark aesthetics! Next.js and Tailwind flow beautifully here." },
    ],
  },
  resp_2: {
    id: "resp_2",
    name: "Sarah Chen",
    email: "sarah.c@example.com",
    submittedAt: "2026-07-19T18:40:00Z",
    status: "completed",
    answers: [
      { question: "What is your name?", answer: "Sarah Chen" },
      { question: "What is your email address?", answer: "sarah.c@example.com" },
      { question: "Which features did you use most?", answer: "Drag and Drop Builder, Schema Export" },
      { question: "Any feedback?", answer: "The Figma-like controls are incredible. Being able to connect nodes visually has simplified our complex client feedback form layout enormously." },
    ],
  },
  resp_3: {
    id: "resp_3",
    name: "Marcus Johnson",
    email: "marcus@example.com",
    submittedAt: "2026-07-19T15:22:00Z",
    status: "completed",
    answers: [
      { question: "What is your name?", answer: "Marcus Johnson" },
      { question: "What is your email address?", answer: "marcus@example.com" },
      { question: "Which features did you use most?", answer: "Visual Flow Editor" },
      { question: "Any feedback?", answer: "Highly developer-focused, fits perfectly in our workflow. Support for nested flows would be a game-changer!" },
    ],
  },
  resp_4: {
    id: "resp_4",
    name: "Emily Taylor",
    email: "emily.t@example.com",
    submittedAt: "2026-07-18T11:05:00Z",
    status: "completed",
    answers: [
      { question: "What is your name?", answer: "Emily Taylor" },
      { question: "What is your email address?", answer: "emily.t@example.com" },
      { question: "Which features did you use most?", answer: "Custom Styling Controls" },
      { question: "Any feedback?", answer: "" }, // empty response to test placeholder
    ],
  },
  resp_5: {
    id: "resp_5",
    name: "David Kim",
    email: "d.kim@example.com",
    submittedAt: "2026-07-17T09:15:00Z",
    status: "in-progress",
    answers: [
      { question: "What is your name?", answer: "David Kim" },
      { question: "What is your email address?", answer: "d.kim@example.com" },
      { question: "Which features did you use most?", answer: "" },
      { question: "Any feedback?", answer: "" },
    ],
  },
};

const RESPONSE_KEYS = ["resp_1", "resp_2", "resp_3", "resp_4", "resp_5"];

export default function IndividualResponsePage() {
  const params = useParams();
  const router = useRouter();
  const formId = (params?.formId || params?.id) as string;
  const responseId = params?.responseId as string;

  const response = RESPONSE_DB[responseId];

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card/25 border border-border rounded-xl">
        <h3 className="text-sm font-semibold text-foreground">Response not found</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">We couldn't retrieve the details for this submission.</p>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => router.push(`/forms/${formId}/responses`)}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Responses
        </Button>
      </div>
    );
  }

  const currentIndex = RESPONSE_KEYS.indexOf(responseId);
  const prevKey = currentIndex > 0 ? RESPONSE_KEYS[currentIndex - 1] : null;
  const nextKey = currentIndex < RESPONSE_KEYS.length - 1 ? RESPONSE_KEYS[currentIndex + 1] : null;

  return (
    <div className="space-y-6">
      {/* Page Header (Sub-breadcrumbs & pagination controls) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={`/forms/${formId}/responses`} className="hover:text-foreground transition-colors font-medium">
            Responses
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate max-w-[150px]">
            {response.name}
          </span>
        </div>

        {/* Previous / Next response pagination buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 border-border"
            disabled={!prevKey}
            onClick={() => router.push(`/forms/${formId}/responses/${prevKey}`)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 border-border"
            disabled={!nextKey}
            onClick={() => router.push(`/forms/${formId}/responses/${nextKey}`)}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Respondent details header card */}
      <Card className="p-5 bg-card border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">{response.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {response.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(response.submittedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {new Date(response.submittedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Status:</span>
            <Badge
              variant={response.status === "completed" ? "success" : "muted"}
              className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5"
            >
              {response.status}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Answer Stack (Vertical Stack) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Form Submission Answers</h3>
        
        <div className="space-y-4">
          {response.answers.map((answer, index) => (
            <Card key={index} className="p-5 bg-card border border-border">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  Question {index + 1}
                </div>
                <div className="text-sm font-semibold text-foreground leading-snug">
                  {answer.question}
                </div>
                <Separator className="my-2 bg-border/40" />
                <div>
                  {answer.answer ? (
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {answer.answer}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 italic">
                      No answer provided
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
