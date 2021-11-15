const express=require('express');
const router=express.Router();

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
    extended: false
}));

router.post('/submitCode', (req, res, next) => {
    const judge_obj = {
        state: 1,//pending 으로 표시
        pending_date: Date.now(),//지금
        code: req.body.code,
        language: req.body.language,
        user_id: req.body.uid,//>
        problem_number: req.body.problem_number,
        memory_usage: 0,
        time_usage: 0,
        ErrorMessage: '',
        is_solution_provide : false,
        belonged_classes:req.body.belonged_class
    };

    model.user.findOne().where('uid').equals(req.body.uid).then(result => {
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
        res.status(200).json({message: 'submit-success'});
    }).catch(err => {
        if(err.message === 'user-not-found') res.status(404).json({message: 'user-not-found'});
        else res.status(500).json('server-error');
    });
});
module.exports = router;