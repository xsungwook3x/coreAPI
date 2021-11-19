const model = require('../model/model.js');
const Classroom = model.classroom;
createClassroom = async (req, res) => {


    try {
        const classroom = new Classroom({
            name: req.body.name,
            classroom_master: req.body.classroom_master,
            class_id: req.body.class_id,
            user_list: [],
            request_student_list: [],
            problem_list: []
        });

        if (!classroom) {
            return res.status(400).json({
                createClassroom: false,
                message: '정보가 다 입력되지 않았습니다'
            })
        }


        const existClassroom = await Classroom.find({ classroom_master: req.body.classroom_master });

        for (let index = 0; index < existClassroom.length; index++) {
            if (existClassroom[index].name == req.body.name) {
                return res.status(400).json({
                    createClassroom: false,
                    message: '이미 존재하는 강의실입니다',
                    data: existClassroom
                })
            }
        }

        if (classroom.name.length > 30) {
            return res.status(400).json({
                createClassroom: false,
                message: "강의실이름은 최대 30자리 입니다"
            })
        }

        classroom
            .save()
            .then(() => {
                return res.status(200).json({
                    createClassroom: true,
                    message: "저장완료",
                    data: classroom,
                })
            })
            .catch((err) => {
                return res.status(400).json({
                    data: err,
                    createClassroom: false,
                    message: '입력되지 않은 정보가 있습니다'
                });
            });



    } catch (e) {
        return;
    }

    return;

}

getStudentlist = async (req, res) => {
    const { class_id } = req.params;


    try {
        let classroom = await Classroom.findOne({ class_id: class_id })
        return res.status(200).json({
            getStudentlist: true,
            message: "학생정보 불러오기 성공",
            data: classroom.student_list,
        })
    } catch (e) {
        return res.status(400).json({
            getStudentlist: false,
            message: '학생정보를 불러올수 없습니다'
        });
    }

}

module.exports = {
    createClassroom,
    getStudentlist
}