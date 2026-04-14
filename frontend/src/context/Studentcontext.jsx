import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTheme } from "../utils/themes.js";

// ── Thème par défaut — évite tout crash si getTheme retourne undefined ──
const DEFAULT_THEME = {
  colors: {
    headerGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    backgroundGradient: "linear-gradient(180deg, #FFF9F4 0%, #F8F7FF 100%)",
    primary: "#7C3AED",
    surface: "#FFFFFF",
    text: "#1E1B4B",
    textMuted: "#9E99B8",
  },
  fonts: {
    heading: "'Nunito', sans-serif",
    body: "'Nunito', sans-serif",
    size: "16px",
    lineHeight: "1.6",
    letterSpacing: "normal",
  },
  borderRadius: "16px",
  animations: true,
};

const StudentContext = createContext(null);

const MOCK_STUDENT = {
  id: "stu_001",
  name: "Liam",
  avatar: "🧒",
  condition: "normal",
  grade: "4th Grade",
  xp: 340,
  level: 5,
  streak: 7,
};

const MOCK_CLASSROOMS = [
  {
    id: "cls_001",
    name: "Mathematics",
    teacher: "Ms. Johnson",
    teacherAvatar: "👩‍🏫",
    color: "#7C3AED",
    emoji: "🔢",
    studentsCount: 24,
    coursesCount: 8,
    lastActivity: "2 hours ago",
    courses: [
      { id: "crs_001", title: "Introduction to Fractions",  pages: 12, uploadedAt: "April 10, 2026", thumbnail: "📐", size: "2.4 MB", completed: true  },
      { id: "crs_002", title: "Multiplication Tables",      pages: 8,  uploadedAt: "April 11, 2026", thumbnail: "✖️", size: "1.8 MB", completed: false },
      { id: "crs_003", title: "Basic Geometry",             pages: 15, uploadedAt: "April 12, 2026", thumbnail: "📏", size: "3.1 MB", completed: false },
    ],
  },
  {
    id: "cls_002",
    name: "Science",
    teacher: "Mr. Ahmed",
    teacherAvatar: "👨‍🔬",
    color: "#059669",
    emoji: "🔬",
    studentsCount: 22,
    coursesCount: 6,
    lastActivity: "Yesterday",
    courses: [
      { id: "crs_004", title: "The Solar System", pages: 20, uploadedAt: "April 9, 2026",  thumbnail: "🪐", size: "4.2 MB", completed: true  },
      { id: "crs_005", title: "Plant Biology",    pages: 14, uploadedAt: "April 11, 2026", thumbnail: "🌱", size: "2.9 MB", completed: false },
    ],
  },
  {
    id: "cls_003",
    name: "English",
    teacher: "Ms. Chen",
    teacherAvatar: "👩‍🏫",
    color: "#0EA5E9",
    emoji: "📚",
    studentsCount: 26,
    coursesCount: 10,
    lastActivity: "3 days ago",
    courses: [
      { id: "crs_006", title: "Creative Writing", pages: 10, uploadedAt: "April 8, 2026", thumbnail: "✍️", size: "1.5 MB", completed: false },
    ],
  },
  {
    id: "cls_004",
    name: "History",
    teacher: "Mr. Dubois",
    teacherAvatar: "👨‍🏫",
    color: "#D97706",
    emoji: "🏛️",
    studentsCount: 20,
    coursesCount: 7,
    lastActivity: "1 week ago",
    courses: [
      { id: "crs_007", title: "Ancient Civilizations", pages: 18, uploadedAt: "April 5, 2026", thumbnail: "🏺", size: "3.8 MB", completed: false },
    ],
  },
];

export function StudentProvider({ children }) {
  const navigate = useNavigate();

  const [student, setStudent]             = useState(MOCK_STUDENT);
  const [classrooms]                      = useState(MOCK_CLASSROOMS);
  const [activeCourse, setActiveCourse]   = useState(null);
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [chatbotOpen, setChatbotOpen]     = useState(false);
  const [theme, setTheme] = useState(
    () => getTheme(MOCK_STUDENT.condition) ?? DEFAULT_THEME
  );

  useEffect(() => {
    const t = getTheme(student.condition) ?? DEFAULT_THEME;
    setTheme(t);
    applyThemeToCss(t);
  }, [student.condition]);

  const applyThemeToCss = (t) => {
    if (!t) return;
    try {
      const root = document.documentElement;
      if (t.colors) {
        Object.entries(t.colors).forEach(([key, val]) => {
          root.style.setProperty(`--color-${key}`, val);
        });
        if (t.colors.backgroundGradient) {
          document.body.style.background = t.colors.backgroundGradient;
        }
      }
      if (t.fonts) {
        root.style.setProperty("--font-heading",   t.fonts.heading   ?? "sans-serif");
        root.style.setProperty("--font-body",      t.fonts.body      ?? "sans-serif");
        root.style.setProperty("--font-size-base", t.fonts.size      ?? "16px");
        root.style.setProperty("--line-height",    t.fonts.lineHeight ?? "1.6");
        root.style.setProperty("--letter-spacing", t.fonts.letterSpacing ?? "normal");
      }
      if (t.borderRadius) {
        root.style.setProperty("--border-radius", t.borderRadius);
      }
    } catch (e) {
      console.warn("applyThemeToCss error:", e);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────
  const enterClassroom = (classroom) => {
    setActiveClassroom(classroom);
    navigate(`/student/classroom/${classroom.id}`);
  };

  const openCourse = (course, classroom) => {
    setActiveCourse(course);
    setActiveClassroom(classroom);
    navigate(`/student/course/${course.id}?classroomId=${classroom.id}`);
  };

  const goBack = () => navigate(-1);

  const updateCondition = (condition) => {
    setStudent((s) => ({ ...s, condition }));
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        classrooms,
        activeCourse,
        activeClassroom,
        chatbotOpen,
        setChatbotOpen,
        theme,
        enterClassroom,
        openCourse,
        goBack,
        updateCondition,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export const useStudent = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  return ctx;
};