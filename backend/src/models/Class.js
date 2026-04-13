// Class.js
const mongoose = require('mongoose')

const classSchema = new mongoose.Schema(
  {
    teacherId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Teacher',
      required: [true, 'teacherId est requis'],
    },
    name: {
      type:     String,
      required: [true, 'name est requis'],
      trim:     true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    
    studentCount: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Un teacher ne peut pas avoir deux classes avec le même nom
classSchema.index(
  { teacherId: 1, name: 1 },
  { unique: true, name: 'unique_class_name_per_teacher' }
)

module.exports = mongoose.model('Class', classSchema)