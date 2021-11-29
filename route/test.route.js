const router = require('express').Router()

const testController = require('../controller/test.controller')

router.get('/', testController.getInformation)

module.exports = router