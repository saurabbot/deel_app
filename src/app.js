const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require('sequelize')
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
// app.get('/', async (req, res) => {
//     res.send('Welcome to Nambiar & co contructions')
// })
// app.get('/contracts/:id', getProfile, async (req, res) => {
    // const { Contract } = req.app.get('models')
    // const { id } = req.params
    // const contract = await Contract.findOne({ where: { id } })
    // if (!contract) return res.status(404).end()
    // if (contract.ClientId !== req.profile.id && contract.ContractorId !== req.profile.id) {
    //     return res.status(401).end();
    // }
    // res.json(contract)
// })
// app.get('/contracts', getProfile, async (req, res) => {
//     const { Contract } = req.app.get('models')
//     const allContracts = await Contract.findAll({
//         where: {
//             status: {
//                 [Op.not]: 'terminated',
//             },
//             [Op.or]: [
//                 { ClientId: req.profile.id },
//                 { ContractorId: req.profile.id },
//             ],
//         },
//     });

//     if (!allContracts) {
//         return res.status(404).end()
//     }
//     res.json(allContracts)
// })
// app.get('/jobs/unpaid', getProfile, async (req, res) => {
//     const { Job, Contract } = req.app.get('models')
//     const activeContracts = await Contract.findAll({
//         where: {
//             status: {
//                 [Op.not]: 'terminated',
//             },
//             [Op.or]: [
//                 { ClientId: req.profile.id },
//                 { ContractorId: req.profile.id },
//             ],
//         },
//     });
//     const activeContractIds = activeContracts.map(contract => contract.id)
//     console.log(activeContractIds, 'bbos')
//     const allJobs = await Job.findAll({
//         where: {
//             ContractId: activeContractIds,
//             paid: false || null
//         }
//     })

//     if (!allJobs) {
//         return res.status(404).end()
//     }
//     return res.json(allJobs)
// })
// app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
//     const { Profile, Job, Contract } = req.app.get('models')
//     const { balance: currentProfileBalance } = req.profile
//     const { job_id } = req.params
//     const job_to_pay_for = await Job.findOne({
//         where: {
//             id: job_id
//         }
//     })
//     const contractAssociatedWithJob = await Contract.findOne({
//         where: {
//             id: job_to_pay_for.ContractId
//         }
//     })
//     const contractorAssociatedWithJob = await Profile.findOne({
//         where: {
//             id: contractAssociatedWithJob.ContractorId
//         }
//     })
//     if (!contractorAssociatedWithJob) {
//         return res.status(404).json({
//             success: false,
//             message: 'No such contractor exists'
//         })
//     }
//     if (contractAssociatedWithJob.status === 'terminated') {
//         return res.status(404).json({
//             success: false,
//             message: 'Job purchase cannot be initiated as contract is terminated',
//         })
//     }
//     if (currentProfileBalance < job_to_pay_for.price) {
//         return res.status(404).json({
//             success: false,
//             message: 'Low balance in acccount, try again later'
//         })
//     }
//     //TODO reducce the amount in  client's acccount
//     const newClientBalance = currentProfileBalance - job_to_pay_for.price
//     await Profile.update({
//         balance: newClientBalance
//     }, {
//         where: {
//             id: req.profile.id
//         }
//     })
//     console.log('Amount has been deducted from clients account ----->')
//     await Profile.update({
//         balance: contractorAssociatedWithJob.balance + job_to_pay_for.price
//     }, {
//         where: {
//             id: contractorAssociatedWithJob.id
//         }
//     })
//     console.log('Amount has been added to Contractor account ----->')

//     console.log(contractAssociatedWithJob, 'eww')
//     return res.json({
//         success: true,
//         message: 'Successfully purchased the jobs'
//     })
// })

// app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
//     const { Profile, Contract, Job } = req.app.get('models')
//     const { userId } = req.params
//     const { amount } = req.body
//     const userIdAsInteger = parseInt(userId, 10);
//     if (userIdAsInteger !== req.profile.id) {
//         return res.status(404).json({
//             success: false,
//             message: 'Sorry, you can only deposit into your own account'
//         })
//     }
//     const recievingUser = await Profile.findOne({
//         where: {
//             id: userId
//         }
//     })
//     const allContractsOfUser = await Contract.findAll({
//         where: {
//             ClientId: userIdAsInteger,
//             status: {
//                 [Op.not]: 'terminated',
//             }
//         }
//     })
//     const allContractsOfUserIds = allContractsOfUser.map(contract => contract.id)
//     const allJobs = await Job.findAll({
//         where: {
//             contractId: allContractsOfUserIds,
//             paid: false || null
//         }
//     })
//     const sumOfPrices = allJobs.reduce((total, job) => total + job.price, 0)
//     if (amount > Math.floor(sumOfPrices / 4)) {
//         return res.status(404).json({
//             success: false,
//             message: 'Deposit amount cannot exceed the summation of prices of your active jobs'
//         })
//     }
//     const updatedUser = await Profile.update({
//         balance: recievingUser.balance + amount
//     }, {
//         where: {
//             id: userId
//         }
//     })
//     return res.status(200).json({
//         success: true,
//         message: 'Deposit successfully to your account',
//         updatedUser
//     })

// })


// app.get('/admin/best-profession', async (req, res) => {
//     const { Profile, Contract, Job } = req.app.get('models');
//     const { start, end } = req.query;

//     try {
//         // Convert the start and end date strings to JavaScript Date objects
//         const startDate = new Date(start);
//         const endDate = new Date(end);

//         // Find all contracts with jobs that were paid within the query time range
//         const contractsWithJobs = await Contract.findAll({
//             where: {
//                 '$Jobs.paymentDate$': {
//                     [Op.between]: [startDate, endDate],
//                 },
//             },
//             include: [
//                 {
//                     model: Job,
//                     as: 'Jobs',
//                     where: {
//                         paid: true,
//                         paymentDate: {
//                             [Op.between]: [startDate, endDate],
//                         },
//                     },
//                 },
//                 {
//                     model: Profile,
//                     as: 'Contractor',
//                     attributes: ['profession'],
//                 },
//             ],
//         });

//         // const professionEarnings = {};
//         // contractsWithJobs.forEach((contract) => {
//         //     const { Contractor } = contract;
//         //     const { profession } = Contractor;
//         //     const jobTotal = contract.Jobs.reduce((total, job) => total + job.price, 0);

//         //     if (!professionEarnings[profession]) {
//         //         professionEarnings[profession] = 0;
//         //     }

//         //     professionEarnings[profession] += jobTotal;
//         // });
//         // console.log(professionEarnings)
//         // // Find the profession with the highest total earnings
//         // let bestProfession = null;
//         // let highestEarnings = 0;

//         // for (const profession in professionEarnings) {
//         //     if (professionEarnings[profession] > highestEarnings) {
//         //         bestProfession = profession;
//         //         highestEarnings = professionEarnings[profession];
//         //     }
//         // }

//         res.json(contractsWithJobs);
//     } catch (error) {
//         console.error('Error calculating best profession:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });
app.use('/', require('./router'));
module.exports = app;
