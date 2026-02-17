const express = require('express');
const router = express.Router();

// Importamos los Middlewares de Seguridad
// Estos son los "guardianes" que verifican el token antes de dejar pasar
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Importamos los Controladores
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const teacherController = require('../controllers/teacherController');
const studentController = require('../controllers/studentController');

// ============================
// 1. RUTAS PÚBLICAS
// ============================
router.post('/login', authController.login);

// ============================
// 2. RUTAS DE ADMINISTRADOR
// ============================
router.get('/admin/teachers', verifyToken, verifyAdmin, adminController.getTeachers);
router.get('/admin/subjects', verifyToken, verifyAdmin, adminController.getSubjects);
router.post('/admin/groups', verifyToken, verifyAdmin, adminController.assignGroup);

// ============================
// 3. RUTAS DE PROFESOR
// ============================
// Requieren estar logueado (verifyToken).
// Internamente, el controlador usa el ID del token o del parámetro para filtrar.
router.get('/teacher/:teacherId/groups', verifyToken, teacherController.getMyGroups);
router.get('/teacher/group/:groupId/students', verifyToken, teacherController.getGroupStudents);
router.post('/teacher/grade', verifyToken, teacherController.updateGrade);

// ============================
// 4. RUTAS DE ALUMNO
// ============================
// Requieren estar logueado (verifyToken).
router.get('/student/:studentId/history', verifyToken, studentController.getHistory);

module.exports = router;