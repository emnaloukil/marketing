const Material = require('../models/Material')

// Create a new material
const createMaterial = async (req, res) => {
  try {
    const {
      teacherId,
      classId,
      sessionId,
      subject,
      title,
      fileUrl,
      uploadedBy,
    } = req.body

    if (!teacherId || !classId || !subject || !title || !fileUrl || !uploadedBy) {
      return res.status(400).json({
        message:
          'teacherId, classId, subject, title, fileUrl and uploadedBy are required',
      })
    }

    const newMaterial = await Material.create({
      teacherId,
      classId,
      sessionId: sessionId || null,
      subject,
      title: title.trim(),
      fileUrl: fileUrl.trim(),
      uploadedBy,
    })

    return res.status(201).json({
      message: 'Material created successfully',
      material: newMaterial,
    })
  } catch (error) {
    console.error('createMaterial error:', error)
    return res.status(500).json({
      message: 'Server error while creating material',
    })
  }
}

// Get all materials for one class
const getMaterialsByClass = async (req, res) => {
  try {
    const { classId } = req.params
    const { subject } = req.query

    if (!classId) {
      return res.status(400).json({
        message: 'classId is required',
      })
    }

    const query = { classId }

    if (subject) {
      query.subject = subject
    }

    const materials = await Material.find(query)
      .sort({ createdAt: -1 })
      .populate('classId', 'name icon')
      .populate('sessionId', 'subject status startedAt endedAt')

    return res.status(200).json({
      count: materials.length,
      materials,
    })
  } catch (error) {
    console.error('getMaterialsByClass error:', error)
    return res.status(500).json({
      message: 'Server error while fetching materials',
    })
  }
}

// Get all materials for one session
const getMaterialsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessionId) {
      return res.status(400).json({
        message: 'sessionId is required',
      })
    }

    const materials = await Material.find({ sessionId })
      .sort({ createdAt: -1 })
      .populate('classId', 'name icon')

    return res.status(200).json({
      count: materials.length,
      materials,
    })
  } catch (error) {
    console.error('getMaterialsBySession error:', error)
    return res.status(500).json({
      message: 'Server error while fetching session materials',
    })
  }
}

// Get one material by id
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params

    const material = await Material.findById(id)
      .populate('classId', 'name icon')
      .populate('sessionId', 'subject status')

    if (!material) {
      return res.status(404).json({
        message: 'Material not found',
      })
    }

    return res.status(200).json({
      material,
    })
  } catch (error) {
    console.error('getMaterialById error:', error)
    return res.status(500).json({
      message: 'Server error while fetching material',
    })
  }
}

// Update a material
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params
    const { subject, title, fileUrl, sessionId } = req.body

    const material = await Material.findById(id)

    if (!material) {
      return res.status(404).json({
        message: 'Material not found',
      })
    }

    if (subject) material.subject = subject
    if (title) material.title = title.trim()
    if (fileUrl) material.fileUrl = fileUrl.trim()
    if (sessionId !== undefined) material.sessionId = sessionId || null

    await material.save()

    return res.status(200).json({
      message: 'Material updated successfully',
      material,
    })
  } catch (error) {
    console.error('updateMaterial error:', error)
    return res.status(500).json({
      message: 'Server error while updating material',
    })
  }
}

// Delete a material
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params

    const material = await Material.findById(id)

    if (!material) {
      return res.status(404).json({
        message: 'Material not found',
      })
    }

    await Material.findByIdAndDelete(id)

    return res.status(200).json({
      message: 'Material deleted successfully',
    })
  } catch (error) {
    console.error('deleteMaterial error:', error)
    return res.status(500).json({
      message: 'Server error while deleting material',
    })
  }
}

module.exports = {
  createMaterial,
  getMaterialsByClass,
  getMaterialsBySession,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
}