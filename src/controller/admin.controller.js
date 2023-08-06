const { Op } = require('sequelize')


class AdminController {
    static async getBestProfession(req, res) {
        const { Profile, Contract, Job } = req.app.get('models');
        const { start, end } = req.query;

        try {
            const startDate = new Date(start);
            const endDate = new Date(end);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error'
                })
            }
            const contractsWithJobs = await Contract.findAll({
                where: {
                    '$Jobs.paymentDate$': {
                        [Op.between]: [startDate, endDate],
                    },
                },
                include: [
                    {
                        model: Job,
                        as: 'Jobs',
                        where: {
                            paid: true,
                            paymentDate: {
                                [Op.between]: [startDate, endDate],
                            },
                        },
                    },
                    {
                        model: Profile,
                        as: 'Contractor',
                        attributes: ['profession'],
                    },
                ],
            });

            const professionEarnings = {};
            contractsWithJobs.forEach((contract) => {
                const { Contractor } = contract;
                const { profession } = Contractor;
                const jobTotal = contract.Jobs.reduce((total, job) => total + job.price, 0);

                if (!professionEarnings[profession]) {
                    professionEarnings[profession] = 0;
                }

                professionEarnings[profession] += jobTotal;
            });
            let bestProfession = null;
            let highestEarnings = 0;

            for (const profession in professionEarnings) {
                if (professionEarnings[profession] > highestEarnings) {
                    bestProfession = profession;
                    highestEarnings = professionEarnings[profession];
                }
            }

            res.json({ success: true, best_profession: bestProfession, earnings: highestEarnings });
        } catch (error) {
            console.error('Error calculating best profession:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getBestClients(req, res) {
        const { Profile, Contract, Job } = req.app.get('models');
        const { start, end, limit } = req.query;
        try {
            const startDate = new Date(start)
            const endDate = new Date(end)
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error'
                })
            }
            const contractsWithJobs = await Contract.findAll({
                where: {
                    '$Jobs.paymentDate$': {
                        [Op.between]: [startDate, endDate],
                    },
                },
                include: [
                    {
                        model: Job,
                        as: 'Jobs',
                        where: {
                            paid: true,
                            paymentDate: {
                                [Op.between]: [startDate, endDate],
                            },
                        },
                    },
                    {
                        model: Profile,
                        as: 'Client',
                        attributes: ['id', 'firstName', 'lastName'],
                    },
                ],
            });

            const allDetails = {}
            contractsWithJobs.forEach((contract) => {
                const clientId = contract.ClientId
                const { Client } = contract
                const totalAmount = contract.Jobs.reduce((total, job) => total + job.price, 0)
                console.log(totalAmount)
                if (!allDetails[clientId]) {
                    allDetails[clientId] = {
                        id: clientId,
                        firstName: Client.firstName,
                        lastName: Client.lastName,
                        totalAmountPaid: 0
                    }
                }
                allDetails[clientId].totalAmountPaid += totalAmount
            })
            const bestClients = Object.values(allDetails).sort((a, b) => b.totalAmountPaid - a.totalAmountPaid)
            res.json({
                success: true,
                best_clients: bestClients.slice(0, limit)
            })
        } catch (error) {
            console.error('Error calculating best profession:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
module.exports = AdminController