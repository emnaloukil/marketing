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
  if (isNaN(parsed.getTime())) {
    throw new Error('dateOfBirth est invalide (format attendu : YYYY-MM-DD)')
  }

  if (supportProfile && !VALID_SUPPORT_PROFILES.includes(supportProfile)) {
    throw new Error(
      `supportProfile invalide : "${supportProfile}". Valeurs acceptées : ${VALID_SUPPORT_PROFILES.join(', ')}`
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
    classId: String(classId).trim(),
    supportProfile,
    parent,
    studentCode,
    pin,
  })

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
  if (!student) throw new Error(`Élève introuvable : ${id}`)
  return student
}

async function getStudentsByClass(classId) {
  if (!classId || !String(classId).trim()) throw new Error('classId est requis')

  const students = await Student.find({
    classId: String(classId).trim(),
  })
    .sort({ lastName: 1, firstName: 1 })
    .lean()

  return students
}

async function joinClassByCode(studentId, classCode) {
  if (!studentId) throw new Error('studentId est requis')
  if (!classCode || !classCode.trim()) throw new Error('classCode est requis')

  const student = await Student.findById(studentId)
  if (!student) throw new Error(`Élève introuvable : ${studentId}`)

  const cls = await Class.findOne({
    classCode: classCode.trim().toUpperCase(),
  }).lean()

  if (!cls) {
    throw new Error('Classe introuvable avec ce code')
  }

  if (!student.classIds.includes(String(cls._id))) {
    student.classIds.push(String(cls._id))
    await student.save()
  }

  return student.toObject()
}

async function getStudentClassroom(studentId) {
  if (!studentId) throw new Error('studentId est requis')

  const student = await Student.findById(studentId).lean()
  if (!student) throw new Error(`Élève introuvable : ${studentId}`)

  if (!student.classIds || student.classIds.length === 0) {
    return {
      joined: false,
      classrooms: [],
    }
  }

  const classrooms = []

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
      materials,
    })
  }

  return {
    joined: true,
    classrooms,
  }
}

async function updateStudent(id, updates) {
  if (updates.supportProfile && !VALID_SUPPORT_PROFILES.includes(updates.supportProfile)) {
    throw new Error(
      `supportProfile invalide : "${updates.supportProfile}". Valeurs acceptées : ${VALID_SUPPORT_PROFILES.join(', ')}`
    )
  }

  if (updates.dateOfBirth) {
    const parsed = new Date(updates.dateOfBirth)
    if (isNaN(parsed.getTime())) {
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

  if (!student) throw new Error(`Élève introuvable : ${id}`)
  return student
}

async function deleteStudent(id) {
  const student = await Student.findById(id)
  if (!student) throw new Error(`Élève introuvable : ${id}`)

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
  updateStudent,
  deleteStudent,
  VALID_SUPPORT_PROFILES,
}