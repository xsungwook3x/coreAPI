
const model = require('../model/model.js');
const User = model.user;




addClassroom = async (req, res) => {
    console.log(req.body);

    try {
        const body = req.body
        let user = await User.findOne({ nick: body.nick });
        if (user == null) {
            console.log(user);

            return res.json({
                updateSuccess: false,
                message: '선생님을 찾을 수 없습니다',
            })
        }


        let preClassroom = user.belonged_classes
        for (let index = 0; index < preClassroom.length; index++) {
            if (preClassroom[index].title === (body.belonged_classes[0].title)) {
                return res.status(200).json({
                    updateSuccess: false,
                    id: user._id,
                    data: user,

                    message: '이미 생성된 강의실입니다',
                })
            }
        }

        preClassroom.push(body.belonged_classes[0]);

        console.log(user.belonged_classes);
        console.log("0000");
        console.log(preClassroom);

        user.belonged_classes = preClassroom


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