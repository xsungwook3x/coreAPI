const model = require('../model/model.js');
const User = model.user;


//회원가입
createUser = async (req, res) => {

    console.log(req);
    const user = new User({
        nick: req.body.nick,
        name: req.body.name,
        password: req.body.password,
        role: req.body.role,
        solved_problems: [],
        phone: req.body.phone,
        affiliation: req.body.affiliation,
        belonged_classes: []
    });

    if (!user) {
        return res.status(400).json({
            registerSuccess: false,
            message: '이미 존재하는 아이디입니다'
        })
    }
    await User.findOne({ nick: req.body.nick }, (err, user) => {
        if (user || err) {
            return res.json({
                registerSuccess: false,
                message: "이미 존재하는 아이디입니다"
            })
        }
    }).catch(err => console.log(err))
    if (user.password.length < 10) {
        return res.json({
            registerSuccess: false,
            message: "비밀번호는 최소 10자리 입니다"
        })
    }
    user.save()
        .then(() => {
            console.log('회원저장')
            return res.status(200).json({ registerSuccess: true })
        })
        .catch((err) => {
            return res.json({
                registerSuccess: false,
                message: '입력되지 않은 정보가 있습니다'
            });
        });


}




//로그인
loginUser = async (req, res) => {
    const { nick, password, role } = req.query;
    console.log(req.query)


    try {
        let user = await User.findOne({ nick: nick })
        console.log(req.query)

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "요청된 아이디에 해당하는 유저가 없습니다.",
                data: user
            })
        }
        //비밀번호가 맞는지 확인 후 
        if (user.password != password)
            return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다" })

        if (user.role != role)
            return res.json({ loginSuccess: false, message: "모드가 틀렸습니다" })

        //생성된 토큰을 쿠키에 저장
        user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);
            res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, useId: user._id })
        })

    } catch (e) {
        return res.status(400).json({
            loginSuccess: false,
            message: '회원정보를 불러올수 없습니다'
        });
    }
}
//원하는 유저 한명가져오기 
getUser = async (req, res) => {
    const { nick } = req.query;
    try {
        let user = await User.findOne({ nick: nick })
        if (!user) {
            return res.json({
                getSuccess: false,
                message: "존재하지 않는 회원입니다",
            })
        }
        return res.json({
            getSuccess: true,
            data: user
        })
    } catch (err) {
        return
    }

}


module.exports = {

    createUser,
    getUser,
    loginUser

}
//모든 유저 정보 가져오기
getUsers = async (req, res) => {
    await User.find({}, (err, users) => {
        if (err) {
            return res.json({
                success: false,
                error: err
            })
        }

        if (!users.length) {
            return res.json({
                success: false,
                error: 'Not user'
            })
        }

        return res.status(200).json({
            success: true,
            data: users
        })
    }).catch(err => console.log(err))
}