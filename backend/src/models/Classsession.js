const mongoose = require('mongoose')

const classSessionSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      required: true,
      trim: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],

    subject: {
      type: String,
      required: true,
      enum: ['mathematics', 'reading', 'sciences'],
    },

    status: {
      type: String,
      default: 'planned',
      enum: ['planned', 'active', 'ended'],
    },

    scheduledAt: {
      type: Date,
      required: false,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },

    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: true,
  }
)

classSessionSchema.index({ date: 1, status: 1 })
classSessionSchema.index({ teacher: 1, status: 1 })
classSessionSchema.index({ classId: 1, status: 1 })

module.exports = mongoose.model('ClassSession', classSessionSchema)