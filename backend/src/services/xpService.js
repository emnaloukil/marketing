const Student = require('../models/Student');

async function awardXp(studentId, amount) {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  student.xp += amount;
  student.totalXp += amount;
  await student.save();

  return { xp: student.xp, totalXp: student.totalXp };
}

async function getStudentXp(studentId) {
  const student = await Student.findById(studentId).select('xp totalXp');
  return student || { xp: 0, totalXp: 0 };
}

module.exports = {
  awardXp,
  getStudentXp
};

