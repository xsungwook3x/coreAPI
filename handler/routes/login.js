const express = require('express');
const router = express.Router();

//const jwt = require('jsonwebtoken');
const model = require('../model/model.js');
const crypto = require('crypto');

const bodyParser = require('body-parser');
router.use(express.json());
router.use(bodyParser.urlencoded({
    extended: false
}));

router.get('/', function(req, res, next) {
    const {nick, password} = req.body;

    model.user.find()
        .where('nick').equals(nick)
        .then(result => {
        if(result.length == 0) {
            throw new Error('login-fail'); // 왜 로그인이 실패했는지 알려주면 보안상으로 안좋습니다.... 왜지..
        }
        const user_info = result[0];

        if(password === user_info.password) {
            res.status(200).json({user_info});
        }
        else {
            throw new Error('login-fail');
        }
    }).catch(err => {
        if(err.message === 'login-fail') {
            res.status(403).json({message: 'login-fail'});
        }
        else {
            console.log(err);
            res.status(500).json({message: 'server-error'});
        }
    });
});

router.post('/userRevise',function(req,res,next){
    
    const user_id = req.body._id;
    const update_info = req.body;

    model.user.updateOne({_id:user_id},{ $set: update_info },{updated :true})
        .then(result =>{
            if(result.nModified === 0) throw new Error('update failure');
            if(result.n === 0) throw new Error('not found');
            res.status(200).json({message: 'name and password is changed'});
        }).catch(err =>{

            if(err.message === 'update failure'){
                res.status(400),json({message :'update failure'});
            }else if(err.message === 'not found'){
                res.status(404).json({message : 'not found'});
            }
            else{
                res.status(500).json({message:'server-error'});
            }
    });
});


router.delete('/userDelete',function(req,res,next){
    const user_id = req.body._id;

    model.user.deleteOne({_id:user_id})
    .then(result =>{
        if(result.nMatched === 0) throw new Error('user do not exist');
        res.status(200).json({message :'user is deleted'});
    }).catch(err =>{
        if(err.message === 'user do not exist'){
            res.status(400).json({message :'user do not exist'});
        }
        else{
        res.status(500).json({message: 'server-error'});
        }
    });
});

module.exports = router;
