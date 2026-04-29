"use client";

import { HeartPulseIcon, ShieldAlertIcon } from "lucide-react";
import { TriageChat } from "../components/triage-chat";

export function TriageView() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b bg-background px-6 py-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
          <HeartPulseIcon className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-none">
            Symptom Assessment
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Describe your symptoms to receive an AI-powered triage assessment
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <TriageChat />
        </div>

        <aside className="hidden w-72 shrink-0 border-l bg-muted/30 p-4 lg:flex lg:flex-col lg:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              How it works
            </p>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              {[
                {
                  step: "1",
                  text: "Describe your symptoms in the chat",
                },
                {
                  step: "2",
                  text: "AI analyses risk level and recommends a specialist",
                },
                {
                  step: "3",
                  text: "Follow precautions for low risk, or start a video consultation for medium/high risk",
                },
                {
                  step: "4",
                  text: "For emergencies, call 108 immediately",
                },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {step}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50/60 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <ShieldAlertIcon className="size-4 text-yellow-700" />
              <p className="text-xs font-semibold text-yellow-900">Disclaimer</p>
            </div>
            <p className="text-xs leading-relaxed text-yellow-800">
              This tool provides informational guidance only. It is not a
              substitute for professional medical advice, diagnosis, or
              treatment. Always consult a qualified healthcare professional.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Risk Levels
            </p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {[
                { color: "bg-green-400", label: "Low", desc: "Monitor at home" },
                { color: "bg-yellow-400", label: "Medium", desc: "See a doctor soon" },
                { color: "bg-orange-400", label: "High", desc: "Seek urgent care" },
                { color: "bg-red-500", label: "Emergency", desc: "Call 108 now" },
              ].map(({ color, label, desc }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${color}`} />
                  <span className="font-medium text-foreground">{label}</span>
                  <span>— {desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
