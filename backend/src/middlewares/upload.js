const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Asegurar que la carpeta uploads existe
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`
    cb(null, filename)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt|xlsx|xls/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype) ||
                   file.mimetype.includes('document') ||
                   file.mimetype.includes('sheet') ||
                   file.mimetype.includes('text')

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes, PDFs, documentos de Word, Excel y archivos de texto'))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: fileFilter
})

module.exports = upload
