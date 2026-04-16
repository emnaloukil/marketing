const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function normalizeFileUrl(fileUrl) {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  if (fileUrl.startsWith("/")) return `${API_ORIGIN}${fileUrl}`;
  return `${API_ORIGIN}/${fileUrl}`;
}

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes || Number.isNaN(Number(sizeInBytes))) return "";
  const bytes = Number(sizeInBytes);
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function mapBackendClassroomToCard(classroom) {
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
      pages: Number(m.pageCount) > 0 ? Number(m.pageCount) : null,
      uploadedAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "",
      thumbnail: "📚",
      size: formatFileSize(m.fileSize),
      completed: Boolean(m.completed),
      fileUrl: normalizeFileUrl(m.fileUrl),
      subject: m.subject,
      mimeType: m.mimeType || "application/pdf",
    })),
  };
}
