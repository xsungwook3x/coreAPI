const express = require('express');
const TeacherCtrl = require('../controllers/Teacher-ctrl');
const ClassroomCtrl = require('../controllers/Classroom-ctrl')
const router = express.Router();


router.post('/room', TeacherCtrl.addClassroom);
router.post('/class', ClassroomCtrl.createClassroom);
router.get('/studentlist/:class_id', ClassroomCtrl.getStudentlist);
module.exports = router;


module.exports = router;
