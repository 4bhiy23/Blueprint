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
import { cn } from "@/lib/utils";

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
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)`, backgroundSize: "24px 24px" }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[hsl(var(--primary))] animate-spin stroke-[2.5]" />
          <p className="text-xs text-slate-700 font-mono font-bold">// LOADING FORM STRUCTURE...</p>
        </div>
      </div>
    );
  }

  if (formQuery.data?.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: `radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)`, backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-md rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white doodle-border-lg p-8 text-center shadow-[6px_8px_0px_0px_hsl(var(--foreground))]">
          <div className="w-16 h-16 bg-[hsl(var(--blueprint-wash))] border-2 border-[hsl(var(--foreground))] text-[hsl(var(--primary))] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black font-doodle text-[hsl(var(--foreground))]">Response Already Submitted</h2>
          <p className="mt-2 text-xs font-sans font-medium text-slate-600 leading-relaxed">This form accepts one response per responder.</p>
          <div className="mt-6 text-[10px] text-slate-500 border-t-2 border-[hsl(var(--foreground))/0.15] pt-4 font-mono font-bold tracking-widest uppercase">
            POWERED BY BLUEPRINT FORMS
          </div>
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
    const heading = availabilityStatus === "closed" ? "Form Closed" : "Form Unavailable";

    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: `radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)`, backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-md rounded-2xl border-2 border-[hsl(var(--foreground))] bg-white doodle-border-lg p-8 text-center shadow-[6px_8px_0px_0px_hsl(var(--foreground))]">
          <div className="w-16 h-16 bg-amber-50 border-2 border-[hsl(var(--foreground))] text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CalendarClock className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black font-doodle text-[hsl(var(--foreground))]">{heading}</h2>
          <p className="mt-2 text-xs font-sans font-medium text-slate-600 leading-relaxed">{message}</p>
          <div className="mt-6 text-[10px] text-slate-500 border-t-2 border-[hsl(var(--foreground))/0.15] pt-4 font-mono font-bold tracking-widest uppercase">
            POWERED BY BLUEPRINT FORMS
          </div>
        </div>
      </div>
    );
  }

  if (!formQuery.data || !formQuery.data.questions?.length) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)`, backgroundSize: "24px 24px" }}
        />
        <div className="relative z-10 text-center max-w-md bg-white border-2 border-[hsl(var(--foreground))] doodle-border-lg p-8 rounded-2xl shadow-[6px_8px_0px_0px_hsl(var(--foreground))]">
          <h2 className="text-2xl font-black font-doodle text-[hsl(var(--foreground))] mb-2">Form Not Found</h2>
          <p className="text-xs font-sans font-medium text-slate-600 mb-6 leading-relaxed">
            The link you followed may be broken, or the form might have been closed or archived by the owner.
          </p>
          <div className="text-[10px] text-slate-500 border-t-2 border-[hsl(var(--foreground))/0.15] pt-4 font-mono font-bold tracking-widest uppercase">
            POWERED BY BLUEPRINT FORMS
          </div>
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
          colors: ["#1D4ED8", "#0F172A", "#2563EB"],
        });
        void confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#1D4ED8", "#0F172A", "#2563EB"],
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
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)`, backgroundSize: "24px 24px" }}
        />
        <div className="relative z-10 text-center max-w-md bg-white border-2 border-[hsl(var(--foreground))] doodle-border-lg p-8 rounded-3xl shadow-[6px_8px_0px_0px_hsl(var(--foreground))] animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-[hsl(var(--blueprint-wash))] border-2 border-[hsl(var(--foreground))] text-[hsl(var(--primary))] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[2px_3px_0px_0px_hsl(var(--foreground))]">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <h2 className="text-3xl font-black font-doodle text-[hsl(var(--foreground))] mb-2 tracking-tight">Response Submitted!</h2>
          <p className="text-slate-600 text-xs font-sans font-medium mb-6 leading-relaxed">
            Thank you for your time. Your answers have been successfully recorded.
          </p>
          <div className="text-[10px] text-slate-500 border-t-2 border-[hsl(var(--foreground))/0.15] pt-4 font-mono font-bold tracking-widest uppercase">
            POWERED BY BLUEPRINT FORMS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Hand-Drawn Blueprint Paper Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)`, backgroundSize: "24px 24px" }}
      />

      {/* Main Card Container */}
      <Card className="relative z-10 w-full max-w-lg bg-white border-2 border-[hsl(var(--foreground))] doodle-border-lg shadow-[6px_8px_0px_0px_hsl(var(--foreground))] p-6 md:p-8 flex flex-col min-h-105 justify-between">

        {/* Top Progress Info */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
            <span className="truncate max-w-50 font-doodle text-sm font-black text-[hsl(var(--foreground))]">{form.title}</span>
            <span className="bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] border-2 border-[hsl(var(--foreground))] shadow-[1.5px_1.5px_0px_0px_hsl(var(--foreground))] px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
              QUESTION {currentIndex + 1} OF {totalQuestions}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-md border-2 border-[hsl(var(--foreground))] overflow-hidden p-0.5">
            <div
              className="bg-[hsl(var(--primary))] h-full rounded-sm transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content Area */}
        <div className="flex-1 flex flex-col justify-center mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black font-doodle text-[hsl(var(--foreground))] tracking-tight leading-snug">
                {currentQuestion.title}
                {currentQuestion.required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
              </h2>
              {currentQuestion.description && (
                <p className="text-slate-600 text-xs mt-1.5 leading-relaxed font-sans font-medium">
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
                  className="h-11 rounded-xl text-xs font-mono"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "number" && (
                <Input
                  type="number"
                  placeholder="Enter a number..."
                  className="h-11 rounded-xl text-xs font-mono"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "email" && (
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 rounded-xl text-xs font-mono"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "paragraph" && (
                <Textarea
                  placeholder="Type your detailed answer..."
                  className="min-h-32 rounded-xl text-xs font-mono border-2 border-[hsl(var(--foreground))] focus-visible:ring-[hsl(var(--primary))]"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "date" && (
                <Input type="date" className="h-11 rounded-xl text-xs font-mono" value={currentAnswer.value} onChange={(e) => updateAnswer(e.target.value, [])} />
              )}

              {currentQuestion.type === "datetime" && (
                <Input type="datetime-local" className="h-11 rounded-xl text-xs font-mono" value={currentAnswer.value} onChange={(e) => updateAnswer(e.target.value, [])} />
              )}

              {currentQuestion.type === "time" && (
                <Input type="time" className="h-11 rounded-xl text-xs font-mono" value={currentAnswer.value} onChange={(e) => updateAnswer(e.target.value, [])} />
              )}

              {currentQuestion.type === "rating" && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={currentQuestion.title}>
                    {Array.from({ length: currentQuestion.ratingMax }, (_, index) => {
                      const rating = String(index + 1);
                      const selected = currentAnswer.value === rating;
                      return (
                        <button
                          key={rating}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => updateAnswer(rating, [])}
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl border-2 text-xs font-bold font-mono transition-all cursor-pointer",
                            selected
                              ? "border-[hsl(var(--foreground))] bg-[hsl(var(--primary))] text-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                              : "border-[hsl(var(--foreground))] bg-white text-[hsl(var(--foreground))] hover:bg-slate-50"
                          )}
                        >
                          {rating}
                        </button>
                      );
                    })}
                  </div>
                  {(currentQuestion.ratingLowLabel || currentQuestion.ratingHighLabel) && (
                    <div className="flex justify-between gap-4 text-xs font-mono font-bold text-slate-500">
                      <span>{currentQuestion.ratingLowLabel}</span>
                      <span className="text-right">{currentQuestion.ratingHighLabel}</span>
                    </div>
                  )}
                </div>
              )}

              {currentQuestion.type === "select" && (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer.optionIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateAnswer(opt.label, [opt.id])}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border-2 text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-[hsl(var(--blueprint-wash))] border-[hsl(var(--foreground))] text-[hsl(var(--primary))] shadow-[2.5px_3px_0px_0px_hsl(var(--foreground))]"
                            : "bg-white border-[hsl(var(--foreground))] text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>{opt.label}</span>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected ? "border-[hsl(var(--foreground))] bg-[hsl(var(--primary))]" : "border-[hsl(var(--foreground))]"
                        )}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
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
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border-2 text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-[hsl(var(--blueprint-wash))] border-[hsl(var(--foreground))] text-[hsl(var(--primary))] shadow-[2.5px_3px_0px_0px_hsl(var(--foreground))]"
                            : "bg-white border-[hsl(var(--foreground))] text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>{opt.label}</span>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected ? "border-[hsl(var(--foreground))] bg-[hsl(var(--primary))]" : "border-[hsl(var(--foreground))]"
                        )}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
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
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border-2 text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-between",
                          isChecked
                            ? "bg-[hsl(var(--blueprint-wash))] border-[hsl(var(--foreground))] text-[hsl(var(--primary))] shadow-[2.5px_3px_0px_0px_hsl(var(--foreground))]"
                            : "bg-white border-[hsl(var(--foreground))] text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>{opt.label}</span>
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                          isChecked ? "border-[hsl(var(--foreground))] bg-[hsl(var(--primary))] text-white" : "border-[hsl(var(--foreground))]"
                        )}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Message */}
            {validationError && (
              <p className="text-xs text-[hsl(var(--destructive))] font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--destructive))]" />
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t-2 border-[hsl(var(--foreground))/0.15] pt-5 mt-4">
          <div>
            {!isFirst && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="h-10 px-4 rounded-xl text-xs font-mono font-bold gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={submitResponse.isPending}
            className="h-10 px-6 rounded-xl font-mono font-bold text-xs gap-1.5"
          >
            {submitResponse.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting
              </>
            ) : isLast ? (
              "Submit"
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Subtle brand footer */}
      <div className="relative z-10 text-[10px] text-slate-500 mt-6 font-mono font-bold tracking-widest uppercase">
        POWERED BY BLUEPRINT FORMS
      </div>
    </div>
  );
}
