import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTheme } from "../utils/themes.js";
import { studentsAPI } from "../api/client";

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

function getStoredStudent() {
  try {
    const raw = localStorage.getItem("ek_user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const id = parsed?._id || parsed?.id || null;

    if (!id) return null;

    return {
      _id: String(id),
      id: String(id),
      name:
        parsed?.name ||
        `${parsed?.firstName || ""} ${parsed?.lastName || ""}`.trim() ||
        "Student",
      avatar: parsed?.avatar || "🧒",
      condition: parsed?.condition || "normal",
      grade: parsed?.grade || "Student",
      xp: parsed?.xp || 0,
      level: parsed?.level || 1,
      streak: parsed?.streak || 0,
      studentCode: parsed?.studentCode || "",
      classIds: parsed?.classIds || [],
      firstName: parsed?.firstName || "",
      lastName: parsed?.lastName || "",
    };
  } catch {
    return null;
  }
}

function mapBackendClassroomToCard(classroom) {
  if (!classroom) return null;

  const materials = classroom.materials || [];

  return {
    id: String(classroom._id || ""),
    name: classroom.name || "Classroom",
    classCode: classroom.classCode || "",
    teacher: classroom.teacherName || "Teacher",
    teacherAvatar: "👩‍🏫",
    color: "#7C3AED",
    emoji: "🏫",
    studentsCount: classroom.studentCount || 0,
    coursesCount: materials.length,
    lastActivity: materials.length ? "Updated recently" : "Just joined",
    courses: materials.map((m) => ({
      id: String(m._id),
      title: m.title,
      pages: 0,
      uploadedAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "",
      thumbnail: "📚",
      size: "",
      completed: false,
      fileUrl: m.fileUrl,
      subject: m.subject,
    })),
  };
}

export function StudentProvider({ children }) {
  const navigate = useNavigate();

  const [student, setStudent] = useState(() => {
    return (
      getStoredStudent() || {
        _id: null,
        id: null,
        name: "Student",
        avatar: "🧒",
        condition: "normal",
        grade: "Student",
        xp: 0,
        level: 1,
        streak: 0,
        studentCode: "",
        classIds: [],
        firstName: "",
        lastName: "",
      }
    );
  });

  const [classrooms, setClassrooms] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);

  const [classroomsVersion, setClassroomsVersion] = useState(0);

  const reloadClassrooms = () => setClassroomsVersion(prev => prev + 1);

  const [theme, setTheme] = useState(
    () => getTheme(student?.condition || "normal") ?? DEFAULT_THEME
  );

  useEffect(() => {
    const stored = getStoredStudent();
    if (stored?._id) {
      setStudent(stored);
    }

    const handleStudentUpdate = () => {
      const stored = getStoredStudent();
      if (stored) {
        setStudent(stored);
      }
    };

    window.addEventListener('studentUpdated', handleStudentUpdate);

    return () => window.removeEventListener('studentUpdated', handleStudentUpdate);
  }, []);

  useEffect(() => {
    const t = getTheme(student?.condition || "normal") ?? DEFAULT_THEME;
    setTheme(t);
    applyThemeToCss(t);
  }, [student?.condition]);

  useEffect(() => {
    const loadStudentClassroom = async () => {
      try {
        const studentId = student?._id || student?.id;
        if (!studentId) {
          setClassrooms([]);
          return;
        }

        setLoadingClassrooms(true);

        const res = await studentsAPI.getClassroom(studentId);
        const data = res?.data;

        if (!data || !data.joined || !data.classrooms) {
          setClassrooms([]);
          return;
        }

        const classroomCards = data.classrooms.map(mapBackendClassroomToCard).filter(Boolean);
        setClassrooms(classroomCards);
      } catch (err) {
        setClassrooms([]);
        console.warn("loadStudentClassroom error:", err.message);
      } finally {
        setLoadingClassrooms(false);
      }
    };

    loadStudentClassroom();
  }, [student, classroomsVersion]);

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
        root.style.setProperty("--font-heading", t.fonts.heading ?? "sans-serif");
        root.style.setProperty("--font-body", t.fonts.body ?? "sans-serif");
        root.style.setProperty("--font-size-base", t.fonts.size ?? "16px");
        root.style.setProperty("--line-height", t.fonts.lineHeight ?? "1.6");
        root.style.setProperty("--letter-spacing", t.fonts.letterSpacing ?? "normal");
      }

      if (t.borderRadius) {
        root.style.setProperty("--border-radius", t.borderRadius);
      }
    } catch (e) {
      console.warn("applyThemeToCss error:", e);
    }
  };

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

  const refreshStudentClassroom = async () => {
    try {
      const studentId = student?._id || student?.id;
      if (!studentId) return;

      const res = await studentsAPI.getClassroom(studentId);
      const data = res?.data;

      if (!data || !data.joined || !data.classInfo) {
        setClassrooms([]);
        return;
      }

      const classroomCard = mapBackendClassroomToCard(data);
      setClassrooms(classroomCard ? [classroomCard] : []);
    } catch (err) {
      console.warn("refreshStudentClassroom error:", err.message);
    }
  };

  const value = useMemo(
    () => ({
      student,
      setStudent,
      classrooms,
      setClassrooms,
      activeCourse,
      activeClassroom,
      chatbotOpen,
      setChatbotOpen,
      theme,
      loadingClassrooms,
      enterClassroom,
      openCourse,
      goBack,
      updateCondition,
      refreshStudentClassroom,
      reloadClassrooms,
    }),
    [
      student,
      classrooms,
      activeCourse,
      activeClassroom,
      chatbotOpen,
      theme,
      loadingClassrooms,
    ]
  );

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudent = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  return ctx;
}