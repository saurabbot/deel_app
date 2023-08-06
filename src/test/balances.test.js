const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { sequelize, Profile, Contract, Job } = require('../model');
const { Op } = require('sequelize')


const { expect } = chai;
chai.use(chaiHttp);
chai.should();
describe('Balance', () => {
    before(async () => {
        await sequelize.sync({ force: true });
        await Promise.all([
            Profile.create({
                id: 1,
                firstName: 'Saurabh',
                lastName: 'Nambiar',
                profession: 'Boxer',
                balance: 1000,
                type: 'client',
            }),
            Profile.create({
                id: 2,
                firstName: 'Saurabh',
                lastName: 'Kumar',
                profession: 'weightlifter',
                balance: 1200,
                type: 'contractor',
            }),
            Contract.create({
                id: 1,
                terms: 'bla bla bla',
                status: 'in_progress',
                ClientId: 1,
                ContractorId: 2
            }),
            Job.create({
                description: 'bigwork',
                price: 200,
                ContractId: 1
            }),
            Job.create({
                description: 'work',
                price: 2020,
                paid: true,
                paymentDate: '2020-08-15T19:11:26.737Z',
                ContractId: 1,
            })
        ])
    })
    describe('/GET Deposit money', () => {
        it('deposit money into own account and not any one else', async () => {
            const profile = await Profile.findOne()
            const depositMoney = Math.random() * 10
            const res = await chai.request(app).post(`/balances/deposit/${profile.id}`).set('profile_id', profile.id).send({
                amount: depositMoney,
            });
            console.log(res.body)
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', true);
            const updatedProfile = await Profile.findOne({
                where: {
                    id: profile.id
                }
            })
            expect(updatedProfile.balance).to.equal(res.body.depositedAmount + profile.balance)
        })
        it('deposit money into own account and not any one else', async () => {
            const profile = await Profile.findOne()
            const depositMoney = 1000000
            const res = await chai.request(app).post(`/balances/deposit/${profile.id}`).set('profile_id', profile.id).send({
                amount: depositMoney,
            });
            expect(res).to.have.status(404);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', false);
            const updatedProfile = await Profile.findOne({
                where: {
                    id: profile.id
                }
            })
            expect(updatedProfile.balance).to.not.equal(res.body.depositedAmount + profile.balance)
        })
    })
})