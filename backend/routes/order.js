const express = require('express')
const { newOrder, getSingleOrder, loggedInUserOrders, orders, updateOrder, deleteOrder } = require('../controller/orderController')
const { isAuthenticatedUser, isAuthorizedUser } = require('../middleware/authenticate')

const router = express.Router()

router.route('/order/new').post(isAuthenticatedUser,newOrder)
router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder)
router.route('/myorders').get(isAuthenticatedUser,loggedInUserOrders)

//Admin routes
router.route('/admin/orders').get(isAuthenticatedUser,isAuthorizedUser('admin'),orders)
router.route('/admin/order/:id').put(isAuthenticatedUser,isAuthorizedUser('admin'),updateOrder)
                                .delete(isAuthenticatedUser,isAuthorizedUser('admin'),deleteOrder)

module.exports = router