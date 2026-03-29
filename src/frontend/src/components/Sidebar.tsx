import { Progress } from "@/components/ui/progress";
import { CATEGORIES, type Lesson, getLessonsByCategory } from "@/data/lessons";
import { useLessonStatus, useProgressPercentage } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  selectedLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
  searchQuery: string;
}

function LessonItem({
  lesson,
  isActive,
  onSelect,
  index,
}: {
  lesson: Lesson;
  isActive: boolean;
  onSelect: () => void;
  index: number;
}) {
  const { data: isComplete } = useLessonStatus(lesson.id);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-left transition-colors",
        isActive
          ? "bg-primary/15 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
      data-ocid={`sidebar.lesson.item.${index}`}
    >
      {isComplete ? (
        <CheckCircle2
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: "var(--green-accent)" }}
        />
      ) : (
        <Circle className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40" />
      )}
      <span className="truncate">{lesson.title}</span>
    </button>
  );
}

function CategorySection({
  category,
  selectedLessonId,
  onSelectLesson,
  searchQuery,
  startIndex,
}: {
  category: string;
  selectedLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
  searchQuery: string;
  startIndex: number;
}) {
  const allLessons = getLessonsByCategory(category);
  const filtered = searchQuery
    ? allLessons.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allLessons;

  const hasActive = filtered.some((l) => l.id === selectedLessonId);
  const [open, setOpen] = useState(hasActive || startIndex < 3);

  if (filtered.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{category}</span>
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      {open && (
        <div className="space-y-0.5">
          {filtered.map((lesson, idx) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === selectedLessonId}
              onSelect={() => onSelectLesson(lesson)}
              index={startIndex + idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  selectedLessonId,
  onSelectLesson,
  searchQuery,
}: SidebarProps) {
  const { data: progressPct } = useProgressPercentage();
  const progress = progressPct ? Number(progressPct) : 0;

  let lessonIndex = 0;

  return (
    <aside
      className="w-64 shrink-0 border-r border-border overflow-y-auto"
      style={{ background: "var(--header-bg)" }}
      data-ocid="sidebar.panel"
    >
      {/* Progress header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            TOPICS
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: "var(--green-accent)" }}
          >
            {progress}%
          </span>
        </div>
        <Progress
          value={progress}
          className="h-1.5"
          data-ocid="sidebar.progress.loading_state"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          {progress > 0
            ? `${progress}% complete`
            : "Start learning Nginx today"}
        </p>
      </div>

      {/* Categories */}
      <nav className="px-2 py-3">
        {CATEGORIES.map((category) => {
          const catLessons = getLessonsByCategory(category);
          const el = (
            <CategorySection
              key={category}
              category={category}
              selectedLessonId={selectedLessonId}
              onSelectLesson={onSelectLesson}
              searchQuery={searchQuery}
              startIndex={lessonIndex}
            />
          );
          lessonIndex += catLessons.length;
          return el;
        })}
      </nav>
    </aside>
  );
}
