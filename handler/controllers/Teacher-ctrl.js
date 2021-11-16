const User = require('../model/User-model');



addClassroom = async (req, res) => {
    const body = req.body
    try {

        let user = await User.findOne({ id: body.id });

        if (!user) {
            return res.status(404).json({
                updateSuccess: err,
                message: '선생님을 찾을 수 없습니다',
            })
        }
        let preClassroom = user.classroom
        for (let index = 0; index < preClassroom.length; index++) {
            if (preClassroom[index].class_id(body.classroom.class_id)) {
                return res.status(200).json({
                    updateSuccess: false,
                    id: user._id,
                    message: '이미 생성된 강의실입니다',
                })
            }
        }
        console.log("현재 " + preClassroom)

        preClassroom.push(body.classroom);
        user.classroom = preClassroom
        user
            .save()
            .then(() => {
                return res.status(200).json({
                    updateSuccess: true,
                    id: user._id,
                    data: user,
                    message: '강의실이 추가되었습니다!',
                })
            })
            .catch(error => {
                return res.status(404).json({
                    updateSuccess: error,
                    message: '에러가 발생되었습니다!',
                })
            })

    } catch (err) {

    }
    return;
}

module.exports = {
    addClassroom
}