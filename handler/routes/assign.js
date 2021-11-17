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
        belonged_classes:req.body.belonged_class,
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
});

router.get('/getResult',function(req,res,next){//결과값 찾아오기 
    const nick=req.body.nick;
    const submit_id=req.body.submit_id;

    model.judge.findOne().where('submit_id').equals(submit_id).then(result => {
        if(result === null) throw new Error('result-not-found');
        res.status(200).json(result);
    }).catch(err => {
        if(err.messate ==='result-not-found') res.status(404).json({message:'result-not-found'});
        else {
            console.log(err);
            res.status(500).json('server-error');
        }
    });
    

});

module.exports = router;