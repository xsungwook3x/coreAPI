const express=require('express');
const router=express.Router();
const model=require('../model/model.js');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
    extended: false
}));

router.post('/',function(req,res,next){//질문 시작

    const save_feedback=model.feedback({
        nick:req.body.nick,
        posting_date: Date.now(),
        class_id:req.body.class_id,
        problem_id:req.body.problem_id,
        title:req.body.title,
        content:req.body.content,
        answer:""

    })

    model.user.findOne().where('nick').equals(req.body.nick).then(result => {
        if(result === null ) throw new Error('invalid-user');
        return save_feedback.save()
    }).then(result => {
        if(result === null) throw new Error('저장실패');
        res.status(200).json({message:'저장성공',feedback_number:result.feedback_number})
    }).catch(err =>{
        if(err === 'invalid-user') res.status(404).json({message:'invalid-user'});
        else if(err === '저장실패') res.status(400).json({message:'저장실패'})
        else{
            res.status(500).json({message:'server-error'});
            console.log(err);
        }
    })
    
})

router.post('/answer',function(req,res,next){//답장
    
    model.feedback.findOne().where('feedback_number').equals(req.body.feedback_number)
    .then( result => {
        if(result === null) throw new Error('not found');
        const changeObj=result;

        changeObj.answer=req.body.answer;

        return model.feedback.updateOne({'feedback_number':req.body.feedback_number},changeObj);
    }).then(result =>{
        if(result === null) throw new Error('저장실패');
        res.status(200).json({message:"저장성공"});
    }).catch(err =>{
        if(err === 'not found') res.status(404).json({message:'not found feedback'})
        else if (err === '저장실패') res.status(400).json({message:'저장실패'});
        else {
            res.status(500).json({message:'server-error'});
            console.log(err);
        }
    })
    return;
})


router.get('/',function(req,res,nexy){
    //피드백찾기 하나
        model.feedback.findOne().where('feedback_number').equals(req.body.feedback_number).then(result =>{
            if(result === null) throw new Error('not found');
            res.status(200).json(result);
        }).catch(err => {
            if(err === 'not found') res.status(404).json({message:'not found feedback'});
            else {
                res.status(500).json({message:'server-error'});
                console.log(err);        }
        })
    })

router.get('/user',function(req,res,nexy){
//유저가만든 피드백및 질문
    model.feedback.find().where('nick').equals(req.body.nick).then(result =>{
        if(result === null) throw new Error('not found');
        res.status(200).json(result);
    }).catch(err => {
        if(err === 'not found') res.status(404).json({message:'not found feedback'});
        else {
            res.status(500).json({message:'server-error'});
            console.log(err);        }
    })
})

router.get('/class',function(req,res,nexy){
//클래스내의 피드백 찾기
    model.feedback.find().where('class_id').equals(req.body.class_ic).then(result =>{
        if(result === null) throw new Error('not found');
        res.status(200).json(result);
    }).catch(err => {
        if(err === 'not found') res.status(404).json({message:'not found feedback'});
        else {
            res.status(500).json({message:'server-error'});
            console.log(err);        }
    })
})

module.exports = router;