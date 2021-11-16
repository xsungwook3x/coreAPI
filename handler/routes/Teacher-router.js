const express = require('express');
const TeacherCtrl = require('../controllers/Teacher-ctrl');
const ClassroomCtrl = require('../controllers/Classroom-ctrl')
const router = express.Router();


router.post('/classroom', TeacherCtrl.addClassroom);
router.post('/classroom', ClassroomCtrl.createClassroom);
router.get('/studentlist/:class_id', ClassroomCtrl.getStudentlist);
module.exports = router;


module.exports = router;
