"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AnswerValue, Question } from "@/lib/tax-rules/types";

interface QuestionFormProps {
  question: Question;
  value: AnswerValue;
  onSubmit: (value: AnswerValue) => void;
}

export function QuestionForm({ question, value, onSubmit }: QuestionFormProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const helpId = useId();

  // Focus le titre à chaque changement de question : annonce la nouvelle
  // question aux lecteurs d'écran, qu'on avance ou qu'on revienne en arrière.
  useEffect(() => {
    headingRef.current?.focus();
  }, [question.id]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold leading-snug outline-none"
        >
          {question.prompt}
        </h2>
        {question.helpText && (
          <p id={helpId} className="mt-1 text-sm text-muted-foreground">
            {question.helpText}
          </p>
        )}
      </div>

      {question.type === "boolean" && (
        <BooleanAnswer headingId={headingId} onSubmit={onSubmit} />
      )}
      {question.type === "single-choice" && (
        <SingleChoiceAnswer question={question} value={value} headingId={headingId} onSubmit={onSubmit} />
      )}
      {question.type === "number" && (
        <NumberAnswer
          question={question}
          value={value}
          helpId={question.helpText ? helpId : undefined}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

function BooleanAnswer({
  headingId,
  onSubmit,
}: {
  headingId: string;
  onSubmit: (value: AnswerValue) => void;
}) {
  return (
    <div role="group" aria-labelledby={headingId} className="flex gap-3">
      <Button type="button" onClick={() => onSubmit(true)}>
        Oui
      </Button>
      <Button type="button" variant="outline" onClick={() => onSubmit(false)}>
        Non
      </Button>
    </div>
  );
}

function SingleChoiceAnswer({
  question,
  value,
  headingId,
  onSubmit,
}: {
  question: Question;
  value: AnswerValue;
  headingId: string;
  onSubmit: (value: AnswerValue) => void;
}) {
  const [draft, setDraft] = useState<string | undefined>(
    typeof value === "string" ? value : undefined,
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (draft !== undefined) onSubmit(draft);
      }}
    >
      <RadioGroup aria-labelledby={headingId} value={draft} onValueChange={setDraft}>
        {question.options?.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
            <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button type="submit" disabled={draft === undefined} className="self-start">
        Suivant
      </Button>
    </form>
  );
}

function NumberAnswer({
  question,
  value,
  helpId,
  onSubmit,
}: {
  question: Question;
  value: AnswerValue;
  helpId: string | undefined;
  onSubmit: (value: AnswerValue) => void;
}) {
  const inputId = useId();
  const errorId = useId();
  const [raw, setRaw] = useState<string>(typeof value === "number" ? String(value) : "");
  const [error, setError] = useState<string | undefined>(undefined);

  const describedBy = [helpId, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = raw.trim() === "" ? Number.NaN : Number(raw);
        const message = question.validate?.(parsed);
        if (message) {
          setError(message);
          return;
        }
        setError(undefined);
        onSubmit(parsed);
      }}
    >
      <Label htmlFor={inputId} className="sr-only">
        {question.prompt}
      </Label>
      <Input
        id={inputId}
        type="number"
        inputMode="decimal"
        min={0}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className="max-w-xs"
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-2 self-start">
        Suivant
      </Button>
    </form>
  );
}
