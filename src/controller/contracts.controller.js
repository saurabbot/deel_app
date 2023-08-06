const { Op } = require('sequelize')

class ContractController {
    static async getContract(req, res) {
        try {
            const { Contract } = req.app.get('models')
            const { id } = req.params
            const contract = await Contract.findOne({ where: { id } })
            if (!contract) return res.status(404).json({
                success: false,
                message: 'No contract was found'
            })
            if (contract.ClientId !== req.profile.id && contract.ContractorId !== req.profile.id) {
                return res.status(401).end();
            }
            res.status(200).json({
                success: true,
                foundContract: contract
            })
        } catch (err) {
            console.log(err)
            res.status(500).json('Internal server error')
        }
    }
    static async getContracts(req, res) {
        try {
            const { Contract } = req.app.get('models')
            const allContracts = await Contract.findAll({
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

            if (!allContracts) {
                return res.status(404).json({
                    success: false,
                    message: 'No contracts were found'
                })
            }
            res.status(200).json({ success: true, allContracts })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            })
        }
    }
}
module.exports = ContractController;