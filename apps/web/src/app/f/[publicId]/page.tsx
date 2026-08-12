"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface PublicForm {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
}

interface PublicQuestionOption {
  id: string;
  label: string;
}

interface PublicQuestion {
  id: string;
  title: string;
  description: string | null;
  type: "text" | "number" | "email" | "select" | "radio" | "checkbox";
  required: boolean;
  options: PublicQuestionOption[];
}

interface PublicFormResponse {
  form: PublicForm;
  questions: PublicQuestion[];
}

interface UserAnswer {
  value: string;
  optionIds: string[];
}

export default function PublicFormResponderPage() {
  const params = useParams();
  const publicId = params?.publicId as string;

  const [formResponse, setFormResponse] = useState<PublicFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Flow State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Time Tracking
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!publicId) return;

    const loadForm = async () => {
      try {
        const response = await apiFetch<PublicFormResponse>(`/public/forms/${publicId}`);
        setFormResponse(response);
        startTimeRef.current = Date.now();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load this form.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadForm();
  }, [publicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formResponse || !formResponse.questions.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative z-10 text-center max-w-md bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-md">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Form Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The link you followed may be broken, or the form might have been closed/archived by the owner.
          </p>
        </div>
      </div>
    );
  }

  const { form, questions } = formResponse;
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
    setSubmitting(true);
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
      await apiFetch(`/public/forms/${form.publicId}/responses`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

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
          colors: ["#6366f1", "#3b82f6", "#10b981"],
        });
        void confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#6366f1", "#3b82f6", "#10b981"],
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
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="relative z-10 text-center max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-lg shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">Response Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Thank you for your time. Your answers have been successfully recorded.
          </p>
          <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
            Powered by Blueprint Forms
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Sleek background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.06),transparent_50%)]" />

      {/* Main glass card container */}
      <Card className="relative z-10 w-full max-w-lg bg-slate-900/60 border-slate-800/85 shadow-2xl rounded-3xl backdrop-blur-xl p-6 md:p-8 flex flex-col min-h-[420px] justify-between transition-all duration-300">
        
        {/* Top Progress Info */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>{form.title}</span>
            <span className="text-primary-foreground bg-primary/20 px-2 py-0.5 rounded-full text-[10px]">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)]"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content Area */}
        <div className="flex-1 flex flex-col justify-center mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight leading-snug">
                {currentQuestion.title}
                {currentQuestion.required && <span className="text-rose-500 ml-1">*</span>}
              </h2>
              {currentQuestion.description && (
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
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
                  className="bg-slate-950/80 border-slate-800 focus-visible:ring-primary h-12 rounded-xl text-slate-200"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "number" && (
                <Input
                  type="number"
                  placeholder="Enter a number..."
                  className="bg-slate-950/80 border-slate-800 focus-visible:ring-primary h-12 rounded-xl text-slate-200"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "email" && (
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-slate-950/80 border-slate-800 focus-visible:ring-primary h-12 rounded-xl text-slate-200"
                  value={currentAnswer.value}
                  onChange={(e) => updateAnswer(e.target.value, [])}
                />
              )}

              {currentQuestion.type === "select" && (
                <div className="relative">
                  <select
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-colors"
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
                    <option value="" disabled className="text-slate-500">Select an option...</option>
                    {currentQuestion.options.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
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
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-205 cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-primary/10 border-primary text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                            : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-900/40 hover:border-slate-700/60"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "border-primary bg-primary" : "border-slate-800"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
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
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-205 cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? "bg-primary/10 border-primary text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                            : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-900/40 hover:border-slate-700/60"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked ? "border-primary bg-primary text-slate-950" : "border-slate-800"
                        }`}>
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
              <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
                <span className="w-1 h-1 rounded-full bg-rose-400" />
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800/50 pt-5 mt-4">
          <div>
            {!isFirst && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="border-slate-800 hover:bg-slate-900 hover:text-slate-100 gap-1.5 h-10 px-4 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={submitting}
            className={`gap-1.5 h-10 px-5 rounded-xl cursor-pointer shadow-md ${
              isLast 
                ? "bg-emerald-650 hover:bg-emerald-600 text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]" 
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting
              </>
            ) : isLast ? (
              <>
                Submit <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Subtle brand footer */}
      <div className="relative z-10 text-[10px] text-slate-650 mt-6 tracking-wide uppercase">
        Blueprint Forms
      </div>
    </div>
  );
}
