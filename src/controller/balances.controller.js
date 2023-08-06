const { Op } = require('sequelize')

class BalanceController {
    static async depositMoney(req, res) {
        try {
            const { Profile, Contract, Job } = req.app.get('models')
            const { userId } = req.params
            const { amount } = req.body
            const userIdAsInteger = parseInt(userId, 10);
            if (userIdAsInteger !== req.profile.id) {
                return res.status(404).json({
                    success: false,
                    message: 'Sorry, you can only deposit into your own account'
                })
            }
            const recievingUser = await Profile.findOne({
                where: {
                    id: userId
                }
            })

            const allJobsOfUser = await Job.findAll({
                where: {
                    paid: {
                        [Op.or]: [false, null],
                    },
                },
                include: {
                    model: Contract,
                    where: {
                        ClientId: req.profile.id,
                        status: {
                            [Op.not]: 'terminated',
                        },
                    },
                },
            });

            const sumOfPrices = allJobsOfUser.reduce((total, job) => total + job.price, 0)

            if (amount > Math.floor(sumOfPrices / 4)) {
                return res.status(404).json({
                    success: false,
                    message: 'Deposit amount cannot exceed the summation of prices of your active jobs'
                })
            }
            const updatedUser = await Profile.update({
                balance: recievingUser.balance + amount
            }, {
                where: {
                    id: userId
                }
            })
            return res.status(200).json({
                success: true,
                message: 'Deposit successfully to your account',
                depositedAmount: amount
            })
        } catch (err) {
            console.error(err)
            return res.status(500).json({
                success: true,
                message: 'Internal Server Error'
            })
        }
    }
}
module.exports = BalanceController