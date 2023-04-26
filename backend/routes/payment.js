const express = require('express')
const { paymentProcess, sendStripeApi } = require('../controller/paymentController')
const { isAuthenticatedUser } = require('../middleware/authenticate')
const router = express.Router()

router.route('/payment/process').post(isAuthenticatedUser, paymentProcess)
router.route('/stripeapi').get(isAuthenticatedUser,sendStripeApi)

module.exports = router