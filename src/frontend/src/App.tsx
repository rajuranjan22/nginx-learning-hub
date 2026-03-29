import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LessonView } from "@/components/LessonView";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { type Lesson, lessons } from "@/data/lessons";
import { useState } from "react";

export default function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="hidden md:flex flex-col"
          style={{ height: "calc(100vh - 3.5rem)" }}
        >
          <Sidebar
            selectedLessonId={selectedLesson.id}
            onSelectLesson={(lesson) => {
              setSelectedLesson(lesson);
              setSearchQuery("");
            }}
            searchQuery={searchQuery}
          />
        </div>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ height: "calc(100vh - 3.5rem)" }}
        >
          <LessonView lesson={selectedLesson} />
          <Footer />
        </main>
      </div>
    </div>
  );
}
