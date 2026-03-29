import { Button } from "@/components/ui/button";
import type { Lesson } from "@/data/lessons";
import { useLessonStatus, useMarkLesson } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { highlightNginx } from "@/utils/nginxHighlight";
import {
  BookOpen,
  Check,
  Copy,
  Lightbulb,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useState } from "react";

interface LessonViewProps {
  lesson: Lesson;
}

export function LessonView({ lesson }: LessonViewProps) {
  const [copied, setCopied] = useState(false);
  const { data: isComplete } = useLessonStatus(lesson.id);
  const { mutate: markLesson, isPending } = useMarkLesson();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lesson.nginxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleComplete = () => {
    markLesson({ lessonId: lesson.id, completed: !isComplete });
  };

  const highlighted = highlightNginx(lesson.nginxCode);
  const lines = lesson.nginxCode.split("\n");

  return (
    <article className="flex-1 overflow-y-auto" data-ocid="lesson.panel">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-3">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--orange-accent)" }}
            data-ocid="lesson.breadcrumb.panel"
          >
            {lesson.category} / Lesson {lesson.lessonNumber}
          </span>
        </div>

        {/* Title & actions */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1
            className="text-2xl md:text-3xl font-bold text-foreground leading-tight"
            data-ocid="lesson.title.panel"
          >
            {lesson.title}
          </h1>
          <Button
            size="sm"
            variant={isComplete ? "secondary" : "default"}
            onClick={handleToggleComplete}
            disabled={isPending}
            className={cn(
              "shrink-0 gap-1.5 text-xs",
              isComplete
                ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25"
                : "bg-primary text-primary-foreground",
            )}
            data-ocid="lesson.complete.toggle"
          >
            {isComplete ? (
              <>
                <Check className="w-3.5 h-3.5" /> Completed
              </>
            ) : (
              "Mark Complete"
            )}
          </Button>
        </div>

        {/* Description */}
        <p
          className="text-base mb-6"
          style={{ color: "var(--body-text)" }}
          data-ocid="lesson.description.panel"
        >
          {lesson.description}
        </p>

        {/* Two-pane widget */}
        <div
          className="rounded-lg border border-border overflow-hidden mb-4"
          style={{ background: "var(--editor-bg)" }}
          data-ocid="lesson.editor.panel"
        >
          {/* Widget header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b border-border"
            style={{ background: "var(--header-bg)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                nginx.conf
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              data-ocid="lesson.copy.button"
            >
              {copied ? (
                <>
                  <Check
                    className="w-3 h-3"
                    style={{ color: "var(--green-accent)" }}
                  />
                  <span style={{ color: "var(--green-accent)" }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>

          {/* Editor + Explanation panes */}
          <div className="flex flex-col lg:flex-row">
            {/* Code pane */}
            <div className="flex-1 overflow-x-auto border-b lg:border-b-0 lg:border-r border-border">
              <div className="flex">
                {/* Line numbers */}
                <div
                  className="select-none text-right py-4 px-3 font-mono text-xs leading-5"
                  style={{
                    color: "var(--muted-text)",
                    minWidth: "2.5rem",
                    userSelect: "none",
                  }}
                >
                  {lines.map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are positional
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code - biome-ignore lint/security/noDangerouslySetInnerHtml: syntax highlighting */}
                <pre
                  className="nginx-code flex-1 py-4 pl-2 pr-4 font-mono text-xs leading-5 overflow-x-auto"
                  style={{ color: "#c9d1d9" }}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled syntax highlighting, no user input
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </div>
            </div>

            {/* Explanation pane */}
            <div className="w-full lg:w-80 shrink-0 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen
                  className="w-4 h-4"
                  style={{ color: "var(--orange-accent)" }}
                />
                <span className="text-sm font-semibold text-foreground">
                  Explanation
                </span>
              </div>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "var(--body-text)" }}
              >
                {lesson.explanation}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <Lightbulb
                  className="w-4 h-4"
                  style={{ color: "var(--green-accent)" }}
                />
                <span className="text-sm font-semibold text-foreground">
                  Tips
                </span>
              </div>
              <ul className="space-y-2">
                {lesson.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 text-xs"
                    style={{ color: "var(--body-text)" }}
                  >
                    <span
                      className="mt-0.5 text-[10px] font-bold shrink-0"
                      style={{ color: "var(--green-accent)" }}
                    >
                      →
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div
          className="rounded-lg border border-border overflow-hidden"
          style={{ background: "var(--terminal-bg)" }}
          data-ocid="lesson.terminal.panel"
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60"
            style={{ background: "oklch(0.13 0.01 220)" }}
          >
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              Terminal
            </span>
          </div>
          <div className="p-4 font-mono text-xs space-y-1.5">
            {lesson.terminalCommands.map((cmd, i) => {
              const isComment = cmd.trimStart().startsWith("#");
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: terminal commands are static
                <div key={i} className="flex items-start gap-2">
                  {!isComment && (
                    <span style={{ color: "var(--green-accent)" }}>$</span>
                  )}
                  <span
                    className={cn("leading-5", isComment ? "col-span-2" : "")}
                    style={{
                      color: isComment ? "var(--muted-text)" : "#c9d1d9",
                    }}
                  >
                    {isComment ? cmd : cmd.split("#")[0]}
                    {!isComment && cmd.includes("#") && (
                      <span style={{ color: "var(--muted-text)" }}>
                        #{cmd.split("#").slice(1).join("#")}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation hint */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Select a lesson from the sidebar to continue
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleToggleComplete}
            disabled={isPending || isComplete === true}
            className={cn(
              "text-xs",
              isComplete
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25",
            )}
            data-ocid="lesson.mark_complete.secondary_button"
          >
            {isComplete ? "✓ Lesson complete" : "Complete & continue →"}
          </Button>
        </div>
      </div>
    </article>
  );
}
