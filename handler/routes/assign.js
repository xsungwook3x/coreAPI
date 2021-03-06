const express=require('express');
const router=express.Router();
const model=require('../model/model.js');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
    extended: false
}));

router.post('/submitCode', (req, res, next) => {
    const submit_id=Math.random().toString(36).substr(2,11);
    const judge_obj = {
        state: 1,//pending 으로 표시
        pending_date: Date.now(),//지금
        code: req.body.code,
        language: req.body.language,
        user_id: req.body.nick,
        problem_id:req.body.problem_id,
        memory_usage: 0,
        time_usage: 0,
        ErrorMessage: '',
        is_solution_provide : false,
        belonged_classes:req.body.belonged_classes,
        feedback:'',
        submit_id:submit_id
    };

    model.user.findOne().where('nick').equals(req.body.nick).then(result => {
        if(result === null) throw new Error('user-not-found');
        const save_judge_result = model.judge(judge_obj);
        return save_judge_result.save()
    }).then(result => {
        // TODO: 여기서 Judge Queue 만들것 지금 당장은 서버가 1개만 있다고 가정 후 코딩
        const save_judge_queue = model.judgeQueue({
            server_number: 1,
            pending_number: result.pending_number
        });
        return save_judge_queue.save();
    }).then(result => {
        res.status(200).json({message: 'submit-success',submit_id:submit_id});
    }).catch(err => {
        if(err.message === 'user-not-found') res.status(404).json({message: 'user-not-found'});
        else res.status(500).json('server-error');
    });
    return;
});

router.get('/getResult',function(req,res,next){//결과값 찾아오기 
    const nick=req.body.nick;
    const submit_id=req.body.submit_id;

    model.judge.findOne().where('submit_id').equals(submit_id).then(result => {
        if(result === null) throw new Error('result-not-found');
        res.status(200).json(result);
        return;
    }).catch(err => {
        if(err.messate ==='result-not-found') res.status(404).json({message:'result-not-found'});
        else {
            console.log(err);
            res.status(500).json('server-error');
        }
    });
    
    return;
});

router.post('/addFeedback',function(req,res,next){//코드에 피드백하기
    model.judge.findOneAndUpdate({submit_id:req.body.submit_id},{$push:{feedback:req.body.feedback}})
    .then(result => {
        if(result === null) throw new Error('추가실패')
        res.status(200).json({message:'추가성공'});
        return;
    }).catch(err => {
        if(err.message === '추가실패') res.status(400).json({message:'추가실패'})
        else{
            res.status(500).json({message:'server-error'});
            console.log(err);
        }
    })
})

router.get('/getAllResult',function(req,res,next){
    const nick =req.body.nick;

    model.judge.find().where('user_id').equals(nick).then( result => {
        if(result === null) throw new Error('result-not-found');
        res.status(200).json(result);
        return;
    }).catch(err => {
        if(err.message ==='result-not-found') res.status(404).json({message:'result-not-found'});
        else {
            console.log(err);
            res.status(500).json('server-error');
        }
    });
    return;
});

router.get('/getClassResult',function(req,res,next){
    const class_name =req.body.class_name;

    model.judge.find().where('belonged_classes').equals(class_name).then( result => {
        if(result === null) throw new Error('result-not-found');
        res.status(200).json(result);
        return;
    }).catch(err => {
        if(err.messate ==='result-not-found') res.status(404).json({message:'result-not-found'});
        else {
            console.log(err);
            res.status(500).json('server-error');
        }
    });
    return;
});

router.get('/assignInClass',function(req,res,next){
    const class_name=req.body.class_name;
    const nick=req.body.nick;

    model.judge.find({user_id:nick,belonged_classes:class_name}).then(result => {
        if(result === null) throw new Error('result-not-found');
        res.status(200).json(result);
        return;
    }).catch(err => {
        if(err.messate ==='result-not-found') res.status(404).json({message:'result-not-found'});
        else {
            console.log(err);
            res.status(500).json('server-error');
        }
    });
    return;
});
module.exports = router;