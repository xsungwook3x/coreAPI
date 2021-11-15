const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

// const userSchema = new mongoose.Schema({
//     role : {type : Number, enum : ['Teacher', 'Student']},
//     nick : {type : String,required: true, unique:true},
//     password : String,
//     name : String,
//     solved_problems : [Number],
//     phone: String,
//     belonged_classes : [String]
// });

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 30,
        unique: 1
    },
    classroom_master: {
        type: String,
        required: true
    },
    class_id: {
        type: String,
        unique: 1
    },
    problem_list: [{
        category: { type: String },

        problem_number: {
            type: Number,
            unique: true
        },
        problem_id: {//문제 아이디->problem schema
            type: String,
            required: true
        }

    }],
    user_list: {
        type: Array,
    },
    request_student_list: {
        type: Array,
    }
});

const problemSchema = new mongoose.Schema({
    name: String,
    problem_description: String,
    sample_input: String,
    sample_output: String,
    input_description: String,
    output_description: String,
    solution: String,  //File 객체가 실제로 없는것으로 확인했습니다. 제 예전 프로젝트도 이 문제 때문에 우회했었네요.
    difficulty: Number,
    Category: [String],
    problem_number: Number,
    input_list: [{ _id: Number, txt: String }],
    output_list: [{ _id: Number, txt: String }],
    spj: Boolean,
    spj_code: String,
    delete_yn: Boolean,
    memory_limit: Number, // Please "Byte"
    time_limit: Number // Please "ms"
});

problemSchema.plugin(autoIncrement.plugin, {
    model: 'Problem',
    field: 'problem_number',
    startAt: 10000
});


const judgeResultSchema = new mongoose.Schema({
    state: { type: Number, enum: ['Pending', 'AC', 'WA', 'TLE', 'MLE', 'RE', 'PE', 'CE', 'JF'] },
    pending_number: {
        type: Number,
        unique: true
    },
    pending_date: Date,
    time_usage: Number,
    memory_usage: Number,
    code: String,
    language: String,
    user_id: String,
    problem_number: Number,
    ErrorMessage: String,
    is_solution_provide: Boolean,
    belonged_classes: String
});

judgeResultSchema.plugin(autoIncrement.plugin, {
    model: 'Judge',
    field: 'pending_number',
    startAt: 100000
});

const judgeQueueSchema = new mongoose.Schema({
    server_number: Number,
    pending_number: Number
});



//참고로 몽구스는 model의 첫 번째 인자로 컬렉션 이름을 만듭니다. User이면 소문자화 후 복수형으로 바꿔서 users 컬렉션이 됩니다.
module.exports = {
    // user : module.exports.user=mongoose.model('User',userSchema),
    classroom: module.exports.classroom = mongoose.model('Classroom', classroomSchema),
    problem: module.exports.problem = mongoose.model('Problem', problemSchema),
    judge: module.exports.judge = mongoose.model('Judge', judgeResultSchema),
    judgeQueue: module.exports.judgeQueue = mongoose.model('JudgeQueue', judgeQueueSchema),
};