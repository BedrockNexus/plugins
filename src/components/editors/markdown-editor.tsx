"use client";

import dynamic from "next/dynamic";

import type { MarkdownEditorCoreProps } from "./markdown-editor-core";

const ClientMarkdownEditor = dynamic(
  () => import("./markdown-editor-core").then((module) => module.MarkdownEditorCore),
  {
    loading: () => (
      <div className="min-h-72 animate-pulse rounded-lg border bg-muted" aria-hidden="true" />
    ),
    ssr: false,
  },
);

export function MarkdownEditor(props: MarkdownEditorCoreProps) {
  return <ClientMarkdownEditor {...props} />;
}
