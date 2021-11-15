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
    belonged_classes: [String],
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
module.exports = mongoose.model('User', userSchema);
