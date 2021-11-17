const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken')

autoIncrement.initialize(mongoose.connection);

const userSchema = new mongoose.Schema({
    role: { type: Number, enum: ['Teacher', 'Student'] },
    nick: { type: String, required: true, unique: true, maxlength: 100 },
    password: {
        type: String,
        minlength: 10
    },
    name: String,
    solved_problems: [Number],
    phone: String,
    belonged_classes: [{ title: String, class_id: String }],
    affiliation: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

//회원가입 시 저장전에 디비에 저장될 비밀번호 암호화
userSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('pw')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.pw, salt, function (err, hash) {
                if (err) {
                    return next(err)
                }
                user.pw = hash
                next();
            })
        })
    } else {
        next()
    }
})
//로그인 시 비밀번호를 암호화해서 디비에 저장된 비밀번호와 비교
userSchema.methods.comparePw = function (plainPw, cb) {
    bcrypt.compare(plainPw, this.pw, function (err, isMatch) {
        if (err)
            return cb(err);

        cb(null, isMatch);
    })
}
//로그인 시 토큰 생성
userSchema.methods.generateToken = function (cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}
//인증 시 토큰과 디비의 토큰을 복호화하여 비교
userSchema.statics.findByToken = function (token, cb) {
    var user = this;
    jwt.verify(token, 'secretToken', function (err, decoded) {
        user.findOne({ "_id": decoded, "token": token }, function (err, user) {
            if (err) return cb(err)
            cb(null, user)
        })
    })
}
const classroomSchema = new mongoose.Schema({
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
        required: true

    },
    problem_list: [{
        category: { type: String },

        problem_number: {
            type: Number,


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
    owner: String,
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
    problem_id: String,
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
    problem_id: String,
    ErrorMessage: String,
    is_solution_provide: Boolean,
    belonged_classes: String,
    submit_id:{type:String, unique:true}
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
    user: module.exports.user = mongoose.model('User', userSchema),
    classroom: module.exports.classroom = mongoose.model('Classroom', classroomSchema),
    problem: module.exports.problem = mongoose.model('Problem', problemSchema),
    judge: module.exports.judge = mongoose.model('Judge', judgeResultSchema),
    judgeQueue: module.exports.judgeQueue = mongoose.model('JudgeQueue', judgeQueueSchema),
};