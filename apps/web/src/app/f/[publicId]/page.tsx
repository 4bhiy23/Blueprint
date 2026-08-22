"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, Check, Loader2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  usePublicFormQuery,
  usePublicResponseMutation,
} from "@/features/forms/queries";
import { toast } from "sonner";

interface UserAnswer {
  value: string;
  optionIds: string[];
}

export default function PublicFormResponderPage() {
  const params = useParams();
  const publicId = params?.publicId as string;

  const [submitted, setSubmitted] = useState(false);
  const formQuery = usePublicFormQuery(publicId);
  const submitResponse = usePublicResponseMutation();

  // Flow State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Time Tracking
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (formQuery.data) startTimeRef.current = Date.now();
  }, [formQuery.data]);

  useEffect(() => {
    if (formQuery.error) {
      toast.error(formQuery.error instanceof Error ? formQuery.error.message : "Unable to load this form.");
    }
  }, [formQuery.error]);

  if (formQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} 
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[hsl(var(--mocha-mauve))] animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">LOADING FORM STRUCTURE...</p>
        </div>
      </div>
    );
  }

  if (formQuery.data?.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          <Check className="mx-auto mb-4 h-9 w-9 text-[hsl(var(--mocha-green))]" />
          <h2 className="text-xl font-bold text-foreground">Response already submitted</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">This form accepts one response per responder.</p>
        </div>
      </div>
    );
  }

  if (formQuery.data && formQuery.data.availabilityStatus !== "accepting") {
    const { availabilityStatus, opensAt, expiresAt } = formQuery.data;
    const message = availabilityStatus === "not_open_yet"
      ? `This form opens at ${new Date(opensAt as string).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
      : availabilityStatus === "expired"
        ? `This form closed at ${new Date(expiresAt as string).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
        : availabilityStatus === "response_limit_reached"
          ? "This form has reached its response limit."
          : availabilityStatus === "closed"
            ? "This form is closed and is no longer accepting responses."
            : availabilityStatus === "archived"
              ? "This form has been archived and is unavailable."
              : "This form has not been published yet.";
    const heading = availabilityStatus === "closed" ? "Form closed" : "Form unavailable";

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          <CalendarClock className="mx-auto mb-4 h-9 w-9 text-[hsl(var(--mocha-peach))]" />
          <h2 className="text-xl font-bold text-foreground">{heading}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (!formQuery.data || !formQuery.data.questions?.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} 
        />
        <div className="relative z-10 text-center max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-2">Form Not Found</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            The link you followed may be broken, or the form might have been closed or archived by the owner.
          </p>
        </div>
      </div>
    );
  }

  const { form, questions } = formQuery.data as Required<typeof formQuery.data>;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const currentAnswer = answers[currentQuestion.id] || { value: "", optionIds: [] };

  const updateAnswer = (value: string, optionIds: string[]) => {
    setValidationError(null);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { value, optionIds },
    }));
  };

  const validateCurrentQuestion = (): boolean => {
    const required = currentQuestion.required;
    const value = currentAnswer.value.trim();
    const optionIds = currentAnswer.optionIds;

    // Check required fields
    if (required) {
      if (
        (currentQuestion.type === "checkbox" && optionIds.length === 0) ||
        (currentQuestion.type === "radio" && optionIds.length === 0) ||
        (currentQuestion.type === "select" && !value) ||
        (currentQuestion.type !== "checkbox" && currentQuestion.type !== "radio" && currentQuestion.type !== "select" && !value)
      ) {
        setValidationError("This field is required.");
        return false;
      }
    }

    // Check specific validation rules
    if (value) {
      if (currentQuestion.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setValidationError("Please enter a valid email address.");
          return false;
        }
      }

      if (currentQuestion.type === "number") {
        if (isNaN(Number(value))) {
          setValidationError("Please enter a valid number.");
          return false;
        }
      }

      if (currentQuestion.type === "rating") {
        const rating = Number(value);
        if (!Number.isInteger(rating) || rating < 1 || rating > currentQuestion.ratingMax) {
          setValidationError(`Choose a rating from 1 to ${currentQuestion.ratingMax}.`);
          return false;
        }
      }
    }

    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    if (isLast) {
      void handleSubmit();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setValidationError(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const completionMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

    const answerPayloads: {
      questionId: string;
      optionIds?: string[];
      value?: string;
    }[] = [];

    for (const [questionId, ans] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === questionId);
      const isOptionBased =
        !!question &&
        (question.type === "select" ||
          question.type === "radio" ||
          question.type === "checkbox");

      if (isOptionBased) {
        if (ans.optionIds.length > 0) {
          answerPayloads.push({ questionId, optionIds: ans.optionIds });
        }
        continue;
      }

      const value = ans.value.trim();
      if (value) {
        answerPayloads.push({ questionId, value });
      }
    }

    const payload = {
      answers: answerPayloads,
      completionMs,
    };

    try {
      await submitResponse.mutateAsync({ publicId: form.publicId, ...payload });

      setSubmitted(true);
      
      // Fire confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        void confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#cba6f7", "#a6e3a1", "#89b4fa"],
        });
        void confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#cba6f7", "#a6e3a1", "#89b4fa"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit response. Please try again.",
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} 
        />
        <div className="relative z-10 text-center max-w-md bg-card border border-border p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-[hsl(var(--mocha-green))/0.15] border border-[hsl(var(--mocha-green))/0.3] text-[hsl(var(--mocha-green))] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 stroke-3" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Response Submitted!</h2>
          <p className="text-muted-foreground text-xs mb-6 leading-relaxed">
            Thank you for your time. Your answers have been successfully recorded.
          </p>
          <div className="text-[10px] text-muted-foreground/60 border-t border-border pt-4 font-mono">
            POWERED BY BLUEPRINT FORMS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ backgroundImage: `radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} 
      />

      {/* Main Card Container */}
      <Card className="relative z-10 w-full max-w-lg bg-card border-border shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col min-h-105 justify-between">
        
        {/* Top Progress Info */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
            <span className="truncate max-w-50">{form.title}</span>
            <span className="bg-[hsl(var(--mocha-mauve))/0.15] text-[hsl(var(--mocha-mauve))] border border-[hsl(var(--mocha-mauve))/0.3] px-2.5 py-0.5 rounded-full text-[10px]">
              QUESTION {currentIndex + 1} OF {totalQuestions}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[hsl(var(--mocha-mauve))] h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content Area */}
        <div className="flex-1 flex flex-col justify-center mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight leading-snug">
                {currentQuestion.title}
                {currentQuestion.required && <span className="text-[hsl(var(--mocha-red))] ml-1">*</span>}
              </h2>
              {currentQuestion.description && (
                <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                  {currentQuestion.description}
                </p>
              )}
            </div>

            {/* Render input components */}
            <div className="pt-2">
              {currentQuestion.type === "text" && (
                <Input
                  type="text"
                  placeholder="Type your answer here..."
                  className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] h-11 rounded-xl text-xs"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "number" && (
                <Input
                  type="number"
                  placeholder="Enter a number..."
                  className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] h-11 rounded-xl text-xs"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "email" && (
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] h-11 rounded-xl text-xs"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "paragraph" && (
                <Textarea
                  placeholder="Type your detailed answer..."
                  className="min-h-32 bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] rounded-xl text-xs"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "date" && (
                <Input type="date" className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] h-11 rounded-xl text-xs" value={currentAnswer.value} onChange={(e) => updateAnswer(e.target.value, [])} />
              )}

              {currentQuestion.type === "datetime" && (
                <Input type="datetime-local" className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] h-11 rounded-xl text-xs" value={currentAnswer.value} onChange={(e) => updateAnswer(e.target.value, [])} />
              )}

              {currentQuestion.type === "time" && (
                <Input type="time" className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] h-11 rounded-xl text-xs" value={currentAnswer.value} onChange={(e) => updateAnswer(e.target.value, [])} />
              )}

              {currentQuestion.type === "rating" && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={currentQuestion.title}>
                    {Array.from({ length: currentQuestion.ratingMax }, (_, index) => {
                      const rating = String(index + 1);
                      const selected = currentAnswer.value === rating;
                      return <button key={rating} type="button" role="radio" aria-checked={selected} onClick={() => updateAnswer(rating, [])} className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${selected ? "border-[hsl(var(--mocha-mauve))] bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))]" : "border-border bg-secondary/40 text-foreground hover:border-border/80"}`}>{rating}</button>;
                    })}
                  </div>
                  {(currentQuestion.ratingLowLabel || currentQuestion.ratingHighLabel) && <div className="flex justify-between gap-4 text-xs text-muted-foreground"><span>{currentQuestion.ratingLowLabel}</span><span className="text-right">{currentQuestion.ratingHighLabel}</span></div>}
                </div>
              )}

              {currentQuestion.type === "select" && (
                <div className="relative">
                  <select
                    className="w-full bg-secondary/40 border border-border text-foreground rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-[hsl(var(--mocha-mauve))] appearance-none transition-colors"
                    value={currentAnswer.optionIds[0] || ""}
                    onChange={(e) => {
                      const optionId = e.target.value;
                      const selectedOpt = currentQuestion.options.find(
                        (o) => o.id === optionId,
                      );
                      updateAnswer(
                        selectedOpt ? selectedOpt.label : "",
                        optionId ? [optionId] : [],
                      );
                    }}
                  >
                    <option value="" disabled className="text-muted-foreground">Select an option...</option>
                    {currentQuestion.options.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-card text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              )}

              {currentQuestion.type === "radio" && (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer.optionIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateAnswer(opt.label, [opt.id])}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[hsl(var(--mocha-mauve))/0.15] border-[hsl(var(--mocha-mauve))] text-foreground"
                            : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "border-[hsl(var(--mocha-mauve))] bg-[hsl(var(--mocha-mauve))]" : "border-border"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-[hsl(var(--mocha-crust))] rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "checkbox" && (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => {
                    const isChecked = currentAnswer.optionIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          let newOptionIds = [...currentAnswer.optionIds];
                          if (isChecked) {
                            newOptionIds = newOptionIds.filter((id) => id !== opt.id);
                          } else {
                            newOptionIds.push(opt.id);
                          }
                          const selectedLabels = currentQuestion.options
                            .filter(o => newOptionIds.includes(o.id))
                            .map(o => o.label)
                            .join(", ");
                          updateAnswer(selectedLabels, newOptionIds);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? "bg-[hsl(var(--mocha-mauve))/0.15] border-[hsl(var(--mocha-mauve))] text-foreground"
                            : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                          isChecked ? "border-[hsl(var(--mocha-mauve))] bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))]" : "border-border"
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Message */}
            {validationError && (
              <p className="text-xs text-[hsl(var(--mocha-red))] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--mocha-red))]" />
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-border pt-5 mt-4">
          <div>
            {!isFirst && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="border-border hover:bg-secondary gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={submitResponse.isPending}
            className={`h-10 px-6 rounded-xl font-bold text-xs transition-all shadow-md ${
              isLast 
                ? "bg-[hsl(var(--mocha-green))] text-[hsl(var(--mocha-crust))] hover:bg-[hsl(var(--mocha-green))/0.9]" 
                : "bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] hover:bg-[hsl(var(--mocha-mauve))/0.9]"
            }`}
          >
            {submitResponse.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Submitting
              </>
            ) : isLast ? (
              "Submit"
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Subtle brand footer */}
      <div className="relative z-10 text-[10px] text-muted-foreground/60 mt-6 font-mono tracking-widest uppercase">
        POWERED BY BLUEPRINT FORMS
      </div>
    </div>
  );
}
