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

router.post('/addClass', function(req,res,next){//클래스만들기
    const user_id = req.body.nick;

    model.user.findOne()
        .where('nick').equals(user_id)
        .then(result => {
            if(result === null) throw new Error('invalid-user');
            if(result.role !== 1) throw new Error('role-auth-fail');
            const classId=Math.random().toString(36).substr(2,11);
            const save_classroom = model.classroom({
                name : req.body.name,
                classroom_master : user_id,
                user_list : [],
                class_id:classId,
                request_student_list: [],
                problem_list:[]
            });

            return save_classroom.save();
        }).then(result => {
            res.status(200).json({'class_id': result.class_id.toString()});
        }).catch(err => {
            if(err.message === 'invalid-user') {
                res.status(400).json({message:'invalid-user'});
            }
            else if(err.message === 'role-auth-fail') {
                res.status(403).json({message: 'role-auth-fail'});//선생님이 아니면
            }
            else {
                res.status(500).json({message: 'server-error'});
            }
    });
});

router.get('/',function(req,res,next){//클래스 정보가져오기
    const class_id=req.body.class_id;

    model.classroom.findOne()
    .where('class_id').equals(class_id)
    .then(result => {
        if(result === null) throw new Error('Invalid-class');
        else{
            res.status(200).json(result);
        }
    }).catch(err => {
        if(err.message === 'Invalid-class'){
            res.status(400).json({message:'Invalid-class'});
        }
        else{
            res.status(500).json({message:'server-error'});
        }
    });
});

router.get('/getClasses/student',function(req,res,next){//학생이 참여한 클래스

    const user_nick=req.body.user_nick;

    model.classroom.find({
        "user_list":{
            $in:[user_nick]
        }
    }).then(result => {
        if(result === null) throw new Error('no class');
        else{
            res.status(200).json(result)
        }
    }).catch(err => {
        if(err.message === 'no class'){
            res.status(400).json({message:'you dont have classes'});
        }else{
            res.status(500).json({message:'server-error'});
        }
    })
    
});

router.get('/getClasses/teacher',function(req,res,next){
    const user_nick=req.body.user_nick;

    model.classroom.find()
    .where('class_master').equals(user_nick)
    .then(result => {
        if(result === null ) throw new Error('invalid classes');
        res.status(200).json(result)
    }).catch(err => {
        if(err.message === 'invalid class'){
            res.status(400).json({message:'there isnt classes'})
        }else{
            res.status(500).json({message:'server-error'});
        }
    })
})

router.post('/addBelonged',function(req,res,next){//클래스 가입하면 추가되는거 구현
    const user_nick=req.body.user_nick;
    const class_id=req.body.class_id;

    model.user.find()
    .update(
        { nick: user_nick }, 
        { $push: { belonged_classes: class_id } })
    .then(result => {
        if(result === null ) throw new Error('추가실패');
        res.status(200).json({message:'추가성공'})
    }).catch(err =>{
        if(err.message === 'invalid class'){
            res.status(400).json({message:'추가실패'});
        }else{
            res.status(500).json({message:'server-error'});
        }
    })

} );

router.delete('/',function(req,res,next){//삭제
    const class_id=req.body.class_id;

    model.classroom.deleteOne()
    .where('class_id').equals(class_id)
    .then(result => {
        if(result ===null) throw new Error('삭제 실패');
        res.status(200).json({message:'삭제성공'});
    }).catch(err => {
        if(err.message === '삭제 실패'){
            res.status(400).json({message:'삭제실패'});
        }else{
            res.status(500).json({message:'server-error'});
        }
    })
})

module.exports = router;