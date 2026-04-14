const mongoose = require('mongoose')

const classSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'teacherId est requis'],
    },
    name: {
      type: String,
      required: [true, 'name est requis'],
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    classCode: {
      type: String,
      required: [true, 'classCode est requis'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

classSchema.index(
  { teacherId: 1, name: 1 },
  { unique: true, name: 'unique_class_name_per_teacher' }
)

classSchema.index(
  { classCode: 1 },
  { unique: true, name: 'unique_class_code' }
)

module.exports = mongoose.model('Class', classSchema)