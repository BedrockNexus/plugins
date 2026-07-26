"use client";

import { RefreshIcon, WorkflowSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The workflow template update failed.";
}

export function WorkflowTemplateEditor() {
  const templates = useQuery(api.functions.admin.workflows.list, {});
  const saveTemplate = useMutation(api.functions.admin.workflows.save);
  const resetTemplate = useMutation(api.functions.admin.workflows.reset);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = templates?.find((template) => template.key === selectedKey) ?? templates?.[0];

  useEffect(() => {
    if (!selected) {
      return;
    }
    setSelectedKey(selected.key);
    setContent(selected.content);
  }, [selected]);

  if (templates === undefined || !selected) {
    return <p className="text-muted-foreground text-sm">Loading workflow templates…</p>;
  }

  const changed = content !== selected.content;

  return (
    <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <Card className="h-fit shadow-none">
        <CardHeader>
          <span className="mb-3 grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon className="size-5" icon={WorkflowSquare01Icon} />
          </span>
          <CardTitle>Workflow variants</CardTitle>
          <CardDescription>
            Each adapter and build system has its own validated template.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.map((template) => (
            <button
              className={
                template.key === selected.key
                  ? "flex w-full flex-col rounded-lg bg-primary p-3 text-left text-primary-foreground"
                  : "flex w-full flex-col rounded-lg border p-3 text-left hover:bg-muted"
              }
              key={template.key}
              onClick={() => {
                setSelectedKey(template.key);
                setContent(template.content);
              }}
              type="button"
            >
              <span className="font-medium text-sm">{template.label}</span>
              <span
                className={
                  template.key === selected.key
                    ? "mt-1 text-primary-foreground/80 text-xs"
                    : "mt-1 text-muted-foreground text-xs"
                }
              >
                {template.source} · version {template.version}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{selected.label}</CardTitle>
              <CardDescription>
                Saved content is used the next time a project installs or updates its workflow.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{selected.source}</Badge>
              <Badge variant="outline">v{selected.version}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-template">GitHub Actions YAML</Label>
            <Textarea
              className="min-h-[36rem] resize-y font-mono text-xs leading-5"
              id="workflow-template"
              onChange={(event) => setContent(event.target.value)}
              spellCheck={false}
              value={content}
            />
          </div>
          <div className="rounded-lg border bg-muted p-3 text-muted-foreground text-sm">
            Keep the <code className="text-foreground">{"{{package_name}}"}</code> placeholder. The
            backend also validates release gating, GitHub Release creation, and least-privilege
            permissions before saving.
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              disabled={busy || selected.source === "default"}
              onClick={async () => {
                setBusy(true);
                try {
                  await resetTemplate({ key: selected.key });
                  toast.success("Workflow restored to the code-defined default.");
                } catch (error) {
                  toast.error(errorMessage(error));
                } finally {
                  setBusy(false);
                }
              }}
              variant="outline"
            >
              <HugeiconsIcon className="size-4" icon={RefreshIcon} />
              Restore default
            </Button>
            <Button
              disabled={busy || !changed}
              onClick={async () => {
                setBusy(true);
                try {
                  const result = await saveTemplate({ key: selected.key, content });
                  toast.success(`Workflow template version ${result.version} saved.`);
                } catch (error) {
                  toast.error(errorMessage(error));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save workflow template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
