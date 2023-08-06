const { Op } = require('sequelize');

class BalanceController {
    static async depositMoney(req, res) {
        try {
            const { Profile, Contract, Job } = req.app.get('models');
            const { userId } = req.params;
            const { amount } = req.body;
            const userIdAsInteger = parseInt(userId, 10);

            if (userIdAsInteger !== req.profile.id) {
                return res.status(404).json({
                    success: false,
                    message: 'Sorry, you can only deposit into your own account',
                });
            }

            const MAX_RETRIES = 5;
            const RETRY_DELAY_MS = 100;

            const performDeposit = async (req, res, userId, amount, transaction, retryCount = 0) => {
                try {
                    const receivingUser = await Profile.findOne({
                        where: {
                            id: userId,
                        },
                        transaction,
                    });

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
                        transaction,
                    });

                    const sumOfPrices = allJobsOfUser.reduce((total, job) => total + job.price, 0);

                    if (amount > Math.floor(sumOfPrices / 4)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Deposit amount cannot exceed the summation of prices of your active jobs',
                        });
                    }

                    await Profile.update(
                        {
                            balance: receivingUser.balance + amount,
                        },
                        {
                            where: {
                                id: userId,
                            },
                            transaction,
                        }
                    );

                    await transaction.commit();

                    return res.status(200).json({
                        success: true,
                        message: 'Deposit successfully to your account',
                        depositedAmount: amount,
                    });
                } catch (error) {
                    if (error.name === 'SequelizeTimeoutError' && retryCount < MAX_RETRIES) {
                        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                        return performDeposit(req, res, userId, amount, transaction, retryCount + 1);
                    } else {
                        await transaction.rollback();
                        throw error;
                    }
                }
            };

            const transaction = await Profile.sequelize.transaction();

            try {
                await performDeposit(req, res, userId, amount, transaction);
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    }
}

module.exports = BalanceController;
