const User = require('../model/User-model');


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

//로그인
loginUser = async (req, res) => {
    const { nick, password } = req.body;

    User.find()
        .where('nick').equals(nick)
        .then(result => {
            if (result.length == 0) {
                throw new Error('login-fail'); // 왜 로그인이 실패했는지 알려주면 보안상으로 안좋습니다.... 왜지..
            }
            const user_info = result[0];

            if (password === user_info.password) {
                res.status(200).json({ user_info });
            }
            else {
                throw new Error('login-fail');
            }
        }).catch(err => {
            if (err.message === 'login-fail') {
                res.status(403).json({ message: 'login-fail' });
            }
            else {
                console.log(err);
                res.status(500).json({ message: 'server-error' });
            }
        });
}
getUser = (req, res) => {
    new Promise((resoleve, reject) => {
        resoleve(User.findOne().where('uid').equals(req.body.uid));
    }).then(result => {
        if (result) throw new Error('already-register');
    }).then(() => {
        res.status(200).json({ message: 'good' });
    }).catch(err => {
        if (err.message === "already-register") {
            /*--------------
            TODO: email token 을 재발급 하는 기능을 만들어야 합니다. 이 부분에 대해서는 토론이 필요합니다. */

            res.status(403).json({ message: 'already-register' });
        }
        else {
            res.status(500).json({ message: 'server-error' });
        }
    });
}


module.exports = {

    createUser,
    getUser,
    loginUser

}
