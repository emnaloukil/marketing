const Student = require('../models/Student')
const Class = require('../models/Class')
const Teacher = require('../models/Teacher')
const Material = require('../models/Material')

const VALID_SUPPORT_PROFILES = ['none', 'adhd', 'autism', 'dyslexia']

function validateStudentData({ firstName, lastName, dateOfBirth, classId, supportProfile }) {
  if (!firstName || !firstName.trim()) throw new Error('firstName est requis')
  if (!lastName || !lastName.trim()) throw new Error('lastName est requis')
  if (!classId || !String(classId).trim()) throw new Error('classId est requis')
  if (!dateOfBirth) throw new Error('dateOfBirth est requis')

  const parsed = new Date(dateOfBirth)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('dateOfBirth est invalide (format attendu : YYYY-MM-DD)')
  }

  if (supportProfile && !VALID_SUPPORT_PROFILES.includes(supportProfile)) {
    throw new Error(
      `supportProfile invalide : "${supportProfile}". Valeurs acceptees : ${VALID_SUPPORT_PROFILES.join(', ')}`
    )
  }
}

async function createStudent(data) {
  const {
    firstName,
    lastName,
    dateOfBirth,
    classId,
    supportProfile = 'none',
    parent,
    studentCode,
    pin,
  } = data

  validateStudentData({ firstName, lastName, dateOfBirth, classId, supportProfile })

  const student = await Student.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    dateOfBirth: new Date(dateOfBirth),
    classIds: classId ? [String(classId).trim()] : [],
    supportProfile,
    parent,
    studentCode,
    pin,
  })

  // If classId provided, increment studentCount in Class
  if (classId) {
    await Class.findByIdAndUpdate(classId, { $inc: { studentCount: 1 } })
  }

  return student
}

async function getAllStudents(filters = {}) {
  const query = {}

  if (filters.supportProfile) {
    if (!VALID_SUPPORT_PROFILES.includes(filters.supportProfile)) {
      throw new Error(`supportProfile invalide : "${filters.supportProfile}"`)
    }
    query.supportProfile = filters.supportProfile
  }

  const students = await Student.find(query)
    .sort({ lastName: 1, firstName: 1 })
    .lean()

  return students
}

async function getStudentById(id) {
  const student = await Student.findById(id).lean()
  if (!student) throw new Error(`Eleve introuvable : ${id}`)
  return student
}

async function getStudentsByClass(classId) {
  if (!classId || !String(classId).trim()) throw new Error('classId est requis')

  const students = await Student.find({
    classIds: String(classId).trim(),
  })
    .sort({ lastName: 1, firstName: 1 })
    .lean()

  return students
}

async function joinClassByCode(studentId, classCode) {
  if (!studentId) throw new Error('studentId est requis')
  if (!classCode || !classCode.trim()) throw new Error('classCode est requis')

  const student = await Student.findById(studentId)
  if (!student) throw new Error(`Eleve introuvable : ${studentId}`)

  const cls = await Class.findOne({
    classCode: classCode.trim().toUpperCase(),
  }).lean()

  if (!cls) {
    throw new Error('Classe introuvable avec ce code')
  }

  if (!student.classIds.includes(String(cls._id))) {
    student.classIds.push(String(cls._id))
    await student.save()

    // Increment studentCount in Class
    await Class.findByIdAndUpdate(cls._id, { $inc: { studentCount: 1 } })
  }

  return student.toObject()
}

async function getStudentClassroom(studentId) {
  if (!studentId) throw new Error('studentId est requis')

  const student = await Student.findById(studentId).lean()
  if (!student) throw new Error(`Eleve introuvable : ${studentId}`)

  if (!student.classIds || student.classIds.length === 0) {
    return {
      joined: false,
      classrooms: [],
    }
  }

  const classrooms = []
  const completedMaterialIds = new Set(
    (student.completedMaterials || []).map((entry) => String(entry.materialId))
  )

  for (const classId of student.classIds) {
    const cls = await Class.findById(classId).lean()
    if (!cls) continue

    const teacher = await Teacher.findById(cls.teacherId).lean()

    const materials = await Material.find({
      classId: String(cls._id),
    })
      .sort({ createdAt: -1 })
      .lean()

    classrooms.push({
      _id: cls._id,
      name: cls.name,
      classCode: cls.classCode,
      teacherId: cls.teacherId,
      teacherName: teacher
        ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
        : '',
      studentCount: cls.studentCount || 0,
      materials: materials.map((material) => ({
        ...material,
        completed: completedMaterialIds.has(String(material._id)),
      })),
    })
  }

  return {
    joined: true,
    classrooms,
  }
}

async function markMaterialComplete(studentId, materialId) {
  if (!studentId) throw new Error('studentId est requis')
  if (!materialId) throw new Error('materialId est requis')

  const [student, material] = await Promise.all([
    Student.findById(studentId),
    Material.findById(materialId).lean(),
  ])

  if (!student) throw new Error(`Eleve introuvable : ${studentId}`)
  if (!material) throw new Error(`Support introuvable : ${materialId}`)

  const belongsToStudent = (student.classIds || []).includes(String(material.classId))
  if (!belongsToStudent) {
    throw new Error("Ce support ne fait pas partie des classes de cet eleve")
  }

  const alreadyCompleted = (student.completedMaterials || []).some(
    (entry) => String(entry.materialId) === String(materialId)
  )

  if (!alreadyCompleted) {
    student.completedMaterials.push({
      materialId,
      completedAt: new Date(),
    })
    await student.save()
  }

  return {
    studentId: String(student._id),
    materialId: String(material._id),
    completed: true,
  }
}

async function markMaterialIncomplete(studentId, materialId) {
  if (!studentId) throw new Error('studentId est requis')
  if (!materialId) throw new Error('materialId est requis')

  const student = await Student.findById(studentId)
  if (!student) throw new Error(`Eleve introuvable : ${studentId}`)

  student.completedMaterials = (student.completedMaterials || []).filter(
    (entry) => String(entry.materialId) !== String(materialId)
  )
  await student.save()

  return {
    studentId: String(student._id),
    materialId: String(materialId),
    completed: false,
  }
}

async function updateStudent(id, updates) {
  if (updates.supportProfile && !VALID_SUPPORT_PROFILES.includes(updates.supportProfile)) {
    throw new Error(
      `supportProfile invalide : "${updates.supportProfile}". Valeurs acceptees : ${VALID_SUPPORT_PROFILES.join(', ')}`
    )
  }

  if (updates.dateOfBirth) {
    const parsed = new Date(updates.dateOfBirth)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('dateOfBirth est invalide (format attendu : YYYY-MM-DD)')
    }
    updates.dateOfBirth = parsed
  }

  if (updates.firstName) updates.firstName = updates.firstName.trim()
  if (updates.lastName) updates.lastName = updates.lastName.trim()
  if (updates.classId) updates.classId = String(updates.classId).trim()

  const student = await Student.findByIdAndUpdate(
    id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
      context: 'query',
    }
  )

  if (!student) throw new Error(`Eleve introuvable : ${id}`)
  return student
}

async function deleteStudent(id) {
  const student = await Student.findById(id)
  if (!student) throw new Error(`Eleve introuvable : ${id}`)

  await student.save()
  return student
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByClass,
  joinClassByCode,
  getStudentClassroom,
  markMaterialComplete,
  markMaterialIncomplete,
  updateStudent,
  deleteStudent,
  VALID_SUPPORT_PROFILES,
}
