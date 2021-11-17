const express = require('express');
const router = express.Router();

const model = require('../model/model.js');
const mongoose = require('mongoose');
const multer = require('multer');

const bodyParser = require('body-parser');
const fs = require('fs');

const path = require('path');

router.use(bodyParser.urlencoded({
    extended: false
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage, limits: { fieldSize: 128 * 1024 * 1024 } }).array('files', 11);

router.post('/addProblem', (req, res, next) => {
    upload(req, res, function(err) {
        if(err) {
            console.log(err);
            res.status(500).json({message:"server-error"});
            return;
        }

        if(req.body.input_list === undefined) req.body.input_list = [];
        if(req.body.output_list === undefined) req.body.output_list = [];
        if(req.body.Category === undefined) req.body.Category = [];
        const newInputList = [].concat(req.body.input_list);
        const newOutputList = [].concat(req.body.output_list);
        const newCategory = [].concat(req.body.Category);

        for(let i = 0; i < newInputList.length; i++) {
            newInputList[i] = {"_id" : i + 1, "txt": newInputList[i]};
            newOutputList[i] = {"_id" : i + 1, "txt": newOutputList[i]};
        }
        const problem_id=Math.random().toString(36).substr(2,11);
        const addProblem = model.problem({
            name: req.body.name,
            owner:req.body.owner,
            problem_description : req.body.problem_description,
            sample_input : req.body.sample_input,
            sample_output : req.body.sample_output,
            input_description : req.body.input_description,
            output_description : req.body.output_description,
            solution : '',
            difficulty : req.body.difficulty,
            Category : newCategory,
            input_list: newInputList,
            output_list: newOutputList,
            problem_id:problem_id,
            memory_limit: parseInt(req.body.memory_limit) * 1024 * 1024,
            time_limit: parseInt(req.body.time_limit) * 1000
        });

        const cpfile = function(filepath, filename, problem_id) {
            new Promise((resolve, reject) => {
                fs.mkdir(path.join(__dirname, `../public/assets/${problem_id}/`), { recursive: true }, err => {
                    if(err) reject(err);
                    else {
                        fs.copyFile(filepath, path.join(__dirname, `../public/assets/${problem_id}/${filename}`), err => {
                            if (err) reject(err);
                            else {
                                fs.unlink(filepath, err => {
                                    if (err) reject(err);
                                    else {
                                        if (filename.slice(-3) === 'pdf') {
                                            model.problem.updateOne({problem_id: problem_id},
                                                {
                                                    $set: {
                                                        "solution":
                                                            path.join(__dirname, `../public/assets/${problem_id}/${filename}`)
                                                    }
                                                }, {updated :true})
                                                .then(result => {
                                                    resolve(result);
                                                }).catch(err => {
                                                reject(err);
                                            });
                                        }
                                        else resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            }).catch(err => {
                console.log(err);
            });
        };

        addProblem.save()
            .then(result => {
                /*for(let i = 0; i < req.files.length; i++) {
                    cpfile(req.files[i].path, req.files[i].filename, result.problem_id);
                }*/
                res.status(200).json({message: "success"},{problem_id:problem_id});
            }).catch(err => {
                console.log(err);
                res.status(500).json({message: "server-error"});
        });
    });
});

router.post('/updateProblem', (req, res, next) => {
    upload(req, res, function(err) {
        if(err) {
            console.log(err);
            res.status(500).json('server-error');
            return;
        }

        if(req.body.input_list === undefined) req.body.input_list = [];
        if(req.body.output_list === undefined) req.body.output_list = [];
        if(req.body.input_list_number === undefined) req.body.input_list_number = [];
        if(req.body.output_list_number === undefined) req.body.output_list_number = [];
        if(req.body.Category === undefined) req.body.Category = [];
        const newInputList = [].concat(req.body.input_list);
        const newOutputList = [].concat(req.body.output_list);
        const newInputListNumber = [].concat(req.body.input_list_number);
        const newOutputListNumber = [].concat(req.body.output_list_number);
        const newCategory = [].concat(req.body.Category);
        for(let i = 0; i < newInputList.length; i++) {
            newInputList[i] = {"_id" : parseInt(newInputListNumber[i]), "txt": newInputList[i]};
            newOutputList[i] = {"_id" : parseInt(newOutputListNumber[i]), "txt": newOutputList[i]};
        }


        const cpfile = function(filepath, filename, problem_number) {
            new Promise((resolve, reject) => {
                fs.mkdir(path.join(__dirname, `../public/assets/${problem_number}/`), { recursive: true }, err => {
                    if(err) reject(err);
                    else {
                        fs.copyFile(filepath, path.join(__dirname, `../public/assets/${problem_number}/${filename}`), err => {
                            if (err) reject(err);
                            else {
                                fs.unlink(filepath, err => {
                                    if (err) reject(err);
                                    else {
                                        if (filename.slice(-3) === 'pdf') {
                                            model.problem.updateOne({problem_number: problem_number},
                                                {
                                                    $set: {
                                                        "solution":
                                                            path.join(__dirname, `../public/assets/${problem_number}/${filename}`)
                                                    }
                                                }, {updated :true})
                                                .then(result => {
                                                    resolve(result);
                                                }).catch(err => {
                                                reject(err);
                                            });
                                        }
                                        else resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            }).catch(err => {
                console.log(err);
            });
        };

        model.problem.findOne().where('problem_number').equals(req.body.problem_number)
            .then(result => {
                if(result === null) throw new Error('none-problem');
                const io_length = result.input_list.length;
                const changeObj = result._doc;
                for(let i = 0; i < newInputList.length; i++) {
                    const posi = changeObj.input_list.findIndex(elem => elem._id === newInputList[i]._id);
                    if(posi === -1) {
                        changeObj.input_list.push(newInputList[i]);
                    }
                    else {
                        changeObj.input_list[posi] = newInputList[i];
                    }

                    const poso = changeObj.output_list.findIndex(elem => elem._id === newOutputList[i]._id);
                    if(poso === -1) {
                        changeObj.output_list.push(newOutputList[i]);
                    }
                    else {
                        changeObj.output_list[poso] = newOutputList[i];
                    }
                }

                if(req.body.spj && req.body.spj_code !== undefined) {
                    changeObj.spj = true;
                    changeObj.spj_code = req.body.spj_code;
                }

                changeObj.name = req.body.name;
                changeObj.problem_description = req.body.problem_description;
                changeObj.sample_input = req.body.sample_input;
                changeObj.sample_output = req.body.sample_output;
                changeObj.input_description = req.body.input_description;
                changeObj.output_description = req.body.output_description;
                changeObj.difficulty = req.body.difficulty;
                changeObj.Category = newCategory;
                changeObj.memory_limit = parseInt(req.body.memory_limit) * 1024 * 1024;
                changeObj.time_limit = parseInt(req.body.time_limit) * 1000;

                for(let i = 0; i < io_length - req.body.io_length; i++) {
                    changeObj.input_list.splice(-1);
                    changeObj.output_list.splice(-1);
                }

                return model.problem.updateOne({"problem_number": req.body.problem_number}, changeObj);
            }).then(result => {
                for(let i = 0; i < req.files.length; i++) {
                    cpfile(req.files[i].path, req.files[i].filename, parseInt(req.body.problem_number));
                }
                res.status(200).json({message: "success"});
            }).catch(result => {
                console.log(err);
                res.status(500).json({message: "server-error"});
        });
    });
});


router.post('/deleteProblem/',function(req,res,next){
    const problemnumber = req.body.problem_number;
    model.problem.updateOne({problem_number : problemnumber},{delete_yn : true},{updated :true})
    .then(result => {
        if(result.nModified === 0) throw new Error('delete failure');
        if(result.n === 0) throw new Error('not found');
        res.status(200).json({message:'prboelm is deleted'});
    }).catch( err =>{
        if(err.message === 'delete failure'){
            res.status(400).json({message:'delete failure'});
        }
        else if(err.message === 'not found'){
            res.status(404).json({message :'not found'});
        }
        else{
            res.status(500).json({message :'server-error'});
        }

    });
});

module.exports = router;