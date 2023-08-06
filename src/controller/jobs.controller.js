const { Op } = require('sequelize')

class JobsController {
    static async getAllUnpaidjobs(req, res) {
        try {
            const { Job, Contract } = req.app.get('models')
            const activeContracts = await Contract.findAll({
                where: {
                    status: {
                        [Op.not]: 'terminated',
                    },
                    [Op.or]: [
                        { ClientId: req.profile.id },
                        { ContractorId: req.profile.id },
                    ],
                },
            });
            const activeContractIds = activeContracts.map(contract => contract.id)
            const allJobs = await Job.findAll({
                where: {
                    ContractId: activeContractIds,
                    paid: false || null
                }
            })

            if (!allJobs) {
                return res.status(404).json({
                    success: true,
                    message: 'no jobs were found'
                })
            }
            return res.json({
                success: true,
                all_unpaid_jobs: allJobs
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                sucess: false,
                message: 'Internal Server Error'
            })
        }
    }
    static async payForJob(req, res) {
        try {
            const { Profile, Job, Contract } = req.app.get('models')
            const { balance: currentProfileBalance } = req.profile
            const { job_id } = req.params
            const job_to_pay_for = await Job.findOne({
                where: {
                    id: job_id
                },
                include: [
                    {
                        model: Contract,
                        include: [
                            {
                                model: Profile,
                                as: 'Contractor'
                            }
                        ]
                    }
                ]
            });
            const contractAssociatedWithJob = job_to_pay_for.Contract
            const contractorAssociatedWithJob = job_to_pay_for?.Contract?.Contractor;
            if (job_to_pay_for.paid === true) {
                return res.status(404).json({
                    success: false,
                    message: 'payment already done'
                })
            }
            if (!contractorAssociatedWithJob) {
                return res.status(404).json({
                    success: false,
                    message: 'No such contractor exists'
                })
            }
            if (contractAssociatedWithJob.status === 'terminated') {
                return res.status(404).json({
                    success: false,
                    message: 'Job purchase cannot be initiated as contract is terminated',
                })
            }
            if (currentProfileBalance < job_to_pay_for.price) {
                return res.status(404).json({
                    success: false,
                    message: 'Low balance in acccount, try again later'
                })
            }
            const newClientBalance = currentProfileBalance - job_to_pay_for.price
            await Profile.update({
                balance: newClientBalance
            }, {
                where: {
                    id: req.profile.id
                }
            })
            console.log('Amount has been deducted from clients account ----->')
            await Profile.update({
                balance: contractorAssociatedWithJob.balance + job_to_pay_for.price
            }, {
                where: {
                    id: contractorAssociatedWithJob.id
                }
            })
            await Job.update({
                paid: true
            }
                , {
                    where: {
                        id: job_id
                    }
                })
            console.log('Amount has been added to Contractor account ----->')

            return res.json({
                success: true,
                message: 'Successfully purchased the jobs',
                job_to_pay_for,
                currentProfileBalance
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                sucess: false,
                message: 'Internal Server Error'
            })
        }
    }
}
module.exports = JobsController