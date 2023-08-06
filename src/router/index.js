const router = require('express').Router()
const authController = require('../controller/contracts.controller')
const jobsController = require('../controller/jobs.controller')
const balancesController = require('../controller/balances.controller')
const adminController = require('../controller/admin.controller')

const { getProfile } = require('../middleware/getProfile')
const { isAdmin } = require('../middleware/isAdmin')


// contracts routes
router.get('/contracts', getProfile, authController.getContracts)
router.get('/contracts/:id', getProfile, authController.getContract)

//jobs routes
router.get('/jobs/unpaid', getProfile, jobsController.getAllUnpaidjobs)
router.post('/jobs/:job_id/pay', getProfile, jobsController.payForJob)

//balances routes
router.post('/balances/deposit/:userId', getProfile, balancesController.depositMoney)

//admin routes
router.get('/admin/best-profession', isAdmin, adminController.getBestProfession)
router.get('/admin/best-clients', isAdmin, adminController.getBestClients)

router.get('/', async (req, res) => {
    res.send('Welcome')
})

module.exports = router