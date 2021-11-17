
const model = require('../model/model.js');
const User = model.user;




addClassroom = async (req, res) => {

    try {
        const body = req.body
        let user = await User.findOne({ nick: body.nick });

        if (!user) {
            return res.status(404).json({
                updateSuccess: err,
                data: user,

                message: '선생님을 찾을 수 없습니다',
            })
        }
        let preClassroom = user.belonged_classes
        for (let index = 0; index < preClassroom.length; index++) {
            if (preClassroom[index][0] === (body.belonged_classes[0])) {
                return res.status(200).json({
                    updateSuccess: false,
                    id: user._id,
                    data: user,

                    message: '이미 생성된 강의실입니다',
                })
            }
        }

        preClassroom.push(body.belonged_classes);
        user.belonged_classes = preClassroom
        console.log(user.belonged_classes);


        user
            .save()
            .then(() => {
                classroom.save();
                return res.status(200).json({
                    updateSuccess: true,
                    id: user._id,
                    data: user,
                    message: '강의실이 추가되었습니다!',
                })
            })
            .catch(error => {
                return;

            })


    } catch (err) {
        return;
    }
    return;

}

module.exports = {
    addClassroom
}