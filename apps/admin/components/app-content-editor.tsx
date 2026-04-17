"use client";

import { useMemo, useState } from "react";
import { updateAdminAppContent } from "@/lib/api";

type LocaleContent = {
  locale: string;
  name: string | null;
  shortName: string | null;
  type: string | null;
  badge: string | null;
  description: string | null;
  longDescription: string | null;
  highlights: string[] | null;
  screenshots: string[] | null;
  features: string[] | null;
  faqs: Array<{ question: string; answer: string }> | null;
  requirements: string[] | null;
  terms: string[] | null;
  steps: string[] | null;
  scores: Array<{ label: string; value: number }> | null;
  screenGradient: string | null;
  glowClass: string | null;
  dark: boolean;
} | null;

type FormState = {
  name: string;
  shortName: string;
  type: string;
  badge: string;
  description: string;
  longDescription: string;
  highlightsText: string;
  screenshotsText: string;
  featuresText: string;
  requirementsText: string;
  termsText: string;
  stepsText: string;
  faqsText: string;
  scoresText: string;
  screenGradient: string;
  glowClass: string;
  dark: boolean;
};

function toLines(value: unknown) {
  return Array.isArray(value) ? value.map(String).join("\n") : "";
}

function toJson(value: unknown) {
  try {
    return JSON.stringify(value ?? [], null, 2);
  } catch {
    return "[]";
  }
}

function buildInitialState(content: LocaleContent): FormState {
  return {
    name: content?.name ?? "",
    shortName: content?.shortName ?? "",
    type: content?.type ?? "",
    badge: content?.badge ?? "",
    description: content?.description ?? "",
    longDescription: content?.longDescription ?? "",
    highlightsText: toLines(content?.highlights),
    screenshotsText: toLines(content?.screenshots),
    featuresText: toLines(content?.features),
    requirementsText: toLines(content?.requirements),
    termsText: toLines(content?.terms),
    stepsText: toLines(content?.steps),
    faqsText: toJson(content?.faqs),
    scoresText: toJson(content?.scores),
    screenGradient: content?.screenGradient ?? "",
    glowClass: content?.glowClass ?? "",
    dark: content?.dark ?? false,
  };
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJsonArray(value: string) {
  if (!value.trim()) return [];
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON value must be an array.");
  }
  return parsed;
}

export default function AppContentEditor({
  slug,
  initialEn,
  initialTr,
}: {
  slug: string;
  initialEn: LocaleContent;
  initialTr: LocaleContent;
}) {
  const [enState, setEnState] = useState<FormState>(() => buildInitialState(initialEn));
  const [trState, setTrState] = useState<FormState>(() => buildInitialState(initialTr));
  const [status, setStatus] = useState<{ en?: string; tr?: string }>({});
  const [saving, setSaving] = useState<{ en: boolean; tr: boolean }>({
    en: false,
    tr: false,
  });

  const hasAnyData = useMemo(() => !!initialEn || !!initialTr, [initialEn, initialTr]);

  async function saveLocale(locale: "en" | "tr") {
    const state = locale === "en" ? enState : trState;
    const setState = locale === "en" ? setEnState : setTrState;

    try {
      setSaving((prev) => ({ ...prev, [locale]: true }));
      setStatus((prev) => ({ ...prev, [locale]: "" }));

      const payload = {
        name: state.name,
        shortName: state.shortName,
        type: state.type,
        badge: state.badge,
        description: state.description,
        longDescription: state.longDescription,
        highlights: parseLines(state.highlightsText),
        screenshots: parseLines(state.screenshotsText),
        features: parseLines(state.featuresText),
        requirements: parseLines(state.requirementsText),
        terms: parseLines(state.termsText),
        steps: parseLines(state.stepsText),
        faqs: parseJsonArray(state.faqsText),
        scores: parseJsonArray(state.scoresText),
        screenGradient: state.screenGradient,
        glowClass: state.glowClass,
        dark: state.dark,
      };

      const result = await updateAdminAppContent(slug, locale, payload);
      const refreshed = result?.content ?? null;

      setState(buildInitialState(refreshed));
      setStatus((prev) => ({ ...prev, [locale]: "Saved successfully." }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed.";
      setStatus((prev) => ({ ...prev, [locale]: message }));
    } finally {
      setSaving((prev) => ({ ...prev, [locale]: false }));
    }
  }

  if (!hasAnyData) {
    return (
      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5 text-sm text-black/60">
        No localized content found.
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <LocaleEditor
        title="English"
        state={enState}
        onChange={setEnState}
        onSave={() => saveLocale("en")}
        isSaving={saving.en}
        status={status.en}
      />
      <LocaleEditor
        title="Turkish"
        state={trState}
        onChange={setTrState}
        onSave={() => saveLocale("tr")}
        isSaving={saving.tr}
        status={status.tr}
      />
    </div>
  );
}

function LocaleEditor({
  title,
  state,
  onChange,
  onSave,
  isSaving,
  status,
}: {
  title: string;
  state: FormState;
  onChange: (next: FormState) => void;
  onSave: () => void;
  isSaving: boolean;
  status?: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          {title}
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="rounded-2xl bg-[#111111] px-4 py-2 text-sm font-bold text-yellow-300 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {status ? (
        <div className="mt-4 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-black/65">
          {status}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <Field
          label="Name"
          value={state.name}
          onChange={(value) => onChange({ ...state, name: value })}
        />
        <Field
          label="Short name"
          value={state.shortName}
          onChange={(value) => onChange({ ...state, shortName: value })}
        />
        <Field
          label="Type"
          value={state.type}
          onChange={(value) => onChange({ ...state, type: value })}
        />
        <Field
          label="Badge"
          value={state.badge}
          onChange={(value) => onChange({ ...state, badge: value })}
        />
        <TextAreaField
          label="Description"
          value={state.description}
          onChange={(value) => onChange({ ...state, description: value })}
          rows={4}
        />
        <TextAreaField
          label="Long description"
          value={state.longDescription}
          onChange={(value) => onChange({ ...state, longDescription: value })}
          rows={6}
        />
        <TextAreaField
          label="Highlights (one per line)"
          value={state.highlightsText}
          onChange={(value) => onChange({ ...state, highlightsText: value })}
        />
        <TextAreaField
          label="Screenshots (one per line)"
          value={state.screenshotsText}
          onChange={(value) => onChange({ ...state, screenshotsText: value })}
        />
        <TextAreaField
          label="Features (one per line)"
          value={state.featuresText}
          onChange={(value) => onChange({ ...state, featuresText: value })}
        />
        <TextAreaField
          label="Requirements (one per line)"
          value={state.requirementsText}
          onChange={(value) => onChange({ ...state, requirementsText: value })}
        />
        <TextAreaField
          label="Terms (one per line)"
          value={state.termsText}
          onChange={(value) => onChange({ ...state, termsText: value })}
        />
        <TextAreaField
          label="Steps (one per line)"
          value={state.stepsText}
          onChange={(value) => onChange({ ...state, stepsText: value })}
        />
        <TextAreaField
          label="FAQs (JSON array)"
          value={state.faqsText}
          onChange={(value) => onChange({ ...state, faqsText: value })}
          rows={8}
        />
        <TextAreaField
          label="Scores (JSON array)"
          value={state.scoresText}
          onChange={(value) => onChange({ ...state, scoresText: value })}
          rows={8}
        />
        <Field
          label="Screen gradient"
          value={state.screenGradient}
          onChange={(value) => onChange({ ...state, screenGradient: value })}
        />
        <Field
          label="Glow class"
          value={state.glowClass}
          onChange={(value) => onChange({ ...state, glowClass: value })}
        />

        <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black/70">
          <input
            type="checkbox"
            checked={state.dark}
            onChange={(event) => onChange({ ...state, dark: event.target.checked })}
          />
          Dark mode screen
        </label>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-black/65">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-black/65">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}
