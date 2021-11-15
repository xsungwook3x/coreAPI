const express = require('express');
const router = express.Router();

const model = require('../model/model.js');
const crypto = require('crypto');

const bodyParser = require('body-parser');
router.use(express.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
router.get ('/check', function(req,res,next){//아이디 체크
    new Promise((resoleve,reject) => {
        resoleve(model.user.findOne().where('uid').equals(req.body.uid));
    }).then(result => {
        if(result) throw new Error('already-register');
    }).then(() => {
        res.status(200).json({message: 'good'});
    }).catch(err => {
        if(err.message === "already-register") {
            /*--------------
            TODO: email token 을 재발급 하는 기능을 만들어야 합니다. 이 부분에 대해서는 토론이 필요합니다. */

            res.status(403).json({message: 'already-register'});
        }
        else {
            res.status(500).json({message: 'server-error'});
        }
    });
});

router.post('/', function(req, res) {//회원가입
    
    try{
    const save_user = model.user({
            nick: req.body.nick,
            name: req.body.name,
            password: req.body.password,
            role: req.body.role,
            solved_problems: [],
            phone:req.body.phone,
            belonged_classes:[]
    });

    save_user.save(err => {
        if (err) {
            console.log(err);
            res.json({ message: '생성실패' });
        return;
        }
        
    res.json({ message: '생성완료' });
   
    });
}catch{
    
}
});

module.exports = router;
