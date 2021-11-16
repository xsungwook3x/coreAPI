const express = require('express');
const UserCtrl = require('../controllers/User-ctrl');
const router = express.Router();

router.post('/', UserCtrl.createUser);
router.get('/', UserCtrl.getUser);


module.exports = router;
