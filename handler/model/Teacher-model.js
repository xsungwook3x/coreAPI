const mongoose = require('mongoose');

const { Schema } = mongoose;

const classroomSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 30,

    },
    classroom_master: {
        type: String,
        required: true
    },
    class_id: {
        type: String,
        unique: true,
        required: true,

    },
    problem_list: [{
        Category: String,
        problem: [{
            problem_number: {
                type: Number,


            },
            problem_id: {//문제 아이디->problem schema
                type: String,

            }
        }]

    }],
    student_list: {
        type: Array,
    },
    request_student_list: {
        type: Array,
    }
})




// 모델 생성, 스키마 이름, 스키마 객체 
module.exports = mongoose.model('Classroom', classroomSchema);