import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTheme } from "../utils/themes.js";
import { studentsAPI } from "../api/client";
import { mapBackendClassroomToCard } from "../utils/studentClassroom.js";

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
      condition:
        parsed?.condition ||
        (parsed?.supportProfile && parsed?.supportProfile !== "none" ? parsed.supportProfile : "normal"),
      supportProfile: parsed?.supportProfile || parsed?.condition || "none",
      dateOfBirth: parsed?.dateOfBirth || null,
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

function markCourseInClassrooms(prevClassrooms, courseId, completed) {
  return prevClassrooms.map((classroom) => ({
    ...classroom,
    courses: (classroom.courses || []).map((course) =>
      String(course.id) === String(courseId)
        ? { ...course, completed }
        : course
    ),
  }));
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
        supportProfile: "none",
        dateOfBirth: null,
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

  const reloadClassrooms = () => setClassroomsVersion((prev) => prev + 1);

  const [theme, setTheme] = useState(
    () => getTheme(student?.condition || "normal") ?? DEFAULT_THEME
  );

  useEffect(() => {
    const stored = getStoredStudent();
    if (stored?._id) {
      setStudent(stored);
    }

    const handleStudentUpdate = () => {
      const nextStored = getStoredStudent();
      if (nextStored) {
        setStudent(nextStored);
      }
    };

    window.addEventListener("studentUpdated", handleStudentUpdate);

    return () => window.removeEventListener("studentUpdated", handleStudentUpdate);
  }, []);

  useEffect(() => {
    const nextTheme = getTheme(student?.condition || "normal") ?? DEFAULT_THEME;
    setTheme(nextTheme);
    applyThemeToCss(nextTheme);
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

  const applyThemeToCss = (nextTheme) => {
    if (!nextTheme) return;

    try {
      const root = document.documentElement;

      if (nextTheme.colors) {
        Object.entries(nextTheme.colors).forEach(([key, val]) => {
          root.style.setProperty(`--color-${key}`, val);
        });

        if (nextTheme.colors.backgroundGradient) {
          document.body.style.background = nextTheme.colors.backgroundGradient;
        }
      }

      if (nextTheme.fonts) {
        root.style.setProperty("--font-heading", nextTheme.fonts.heading ?? "sans-serif");
        root.style.setProperty("--font-body", nextTheme.fonts.body ?? "sans-serif");
        root.style.setProperty("--font-size-base", nextTheme.fonts.size ?? "16px");
        root.style.setProperty("--line-height", nextTheme.fonts.lineHeight ?? "1.6");
        root.style.setProperty("--letter-spacing", nextTheme.fonts.letterSpacing ?? "normal");
      }

      if (nextTheme.borderRadius) {
        root.style.setProperty("--border-radius", nextTheme.borderRadius);
      }
    } catch (err) {
      console.warn("applyThemeToCss error:", err);
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
    setStudent((current) => ({ ...current, condition }));
  };

  const refreshStudentClassroom = async () => {
    try {
      const studentId = student?._id || student?.id;
      if (!studentId) return;

      const res = await studentsAPI.getClassroom(studentId);
      const data = res?.data;

      if (!data || !data.joined || !Array.isArray(data.classrooms)) {
        setClassrooms([]);
        return;
      }

      const classroomCards = data.classrooms.map(mapBackendClassroomToCard).filter(Boolean);
      setClassrooms(classroomCards);
    } catch (err) {
      console.warn("refreshStudentClassroom error:", err.message);
    }
  };

  const updateCompletionState = (courseId, completed) => {
    setClassrooms((prev) => markCourseInClassrooms(prev, courseId, completed));
    setActiveCourse((prev) =>
      prev && String(prev.id) === String(courseId)
        ? { ...prev, completed }
        : prev
    );
    setActiveClassroom((prev) =>
      prev
        ? {
            ...prev,
            courses: (prev.courses || []).map((course) =>
              String(course.id) === String(courseId)
                ? { ...course, completed }
                : course
            ),
          }
        : prev
    );
  };

  const markCourseComplete = async (courseId) => {
    const studentId = student?._id || student?.id;
    if (!studentId) throw new Error("Student not found");

    const response = await studentsAPI.completeMaterial(studentId, courseId);
    updateCompletionState(courseId, true);
    return response;
  };

  const markCourseIncomplete = async (courseId) => {
    const studentId = student?._id || student?.id;
    if (!studentId) throw new Error("Student not found");

    const response = await studentsAPI.uncompleteMaterial(studentId, courseId);
    updateCompletionState(courseId, false);
    return response;
  };

  const value = {
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
    markCourseComplete,
    markCourseIncomplete,
  };

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
};
