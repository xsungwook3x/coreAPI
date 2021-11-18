const mongoose = require('mongoose');
const config = require('./config.js');
const express = require('express');
const app = express();
const cors = require('cors');
const port = 5000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

mongoose.connect(config.mongodbUri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
    console.log('connected to mongodb server')
});

const model = require('./model/model');
const syncQueue = require('sync-queue');
const Queue = new syncQueue();

const pushQueue = require('./pushQueue');

const assign = require('./routes/assign.js');
const problem = require('./routes/problem.js');
const register = require('./routes/register.js');
const login = require('./routes/login.js');
const classes = require('./routes/class.js');
const feedback=require('./routes/feedback.js');

const userRouter = require('./routes/User-router');
const teacherRouter = require('./routes/Teacher-router');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: ['http://localhost:3000'],
        credentials: true,
    }),
);
app.get('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.send('살려주세요ㅠㅠㅠ');
});
app.use('/api/assign', assign);
app.use('/api/problem', problem);
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/class', classes);
app.use('/api/feedback',feedback);

app.use('/api/user', userRouter);
app.use('/api/teacher', teacherRouter);



setInterval(() => {
    model.judgeQueue.find()
        .where('server_number').equals(config.serverNumber)
        .sort({ 'pending_number': 1 }).limit(1)
        .then(result => {
            if (result.length === 0) throw new Error('no-judge-queue');
            pushQueue(Queue, result[0]);
            return model.judgeQueue.where('pending_number').equals(result[0].pending_number)
                .deleteOne();
        }).catch(err => {
        });
}, 5000);

app.listen(port, () => {
    console.log('server is running...');
});