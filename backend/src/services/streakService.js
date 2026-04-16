const Student = require('../models/Student');

async function updateStreak(studentId) {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const lastDate = student.lastActivityDate;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!lastDate || lastDate < yesterday) {
    // Reset streak
    student.currentStreakDays = 1;
  } else if (lastDate.toDateString() === yesterday.toDateString()) {
    // Continue streak
    student.currentStreakDays += 1;
    if (student.currentStreakDays > student.longestStreak) {
      student.longestStreak = student.currentStreakDays;
    }
  } // else same day, no change

  student.lastActivityDate = today;
  await student.save();

  return {
    currentStreakDays: student.currentStreakDays,
    longestStreak: student.longestStreak
  };
}

module.exports = {
  updateStreak
};

