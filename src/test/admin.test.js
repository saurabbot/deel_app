const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { sequelize, Profile, Contract, Job } = require('../model');
const { Op } = require('sequelize')


const { expect } = chai;
chai.use(chaiHttp);
chai.should();
describe('admin', () => {
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
                isAdmin: true
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
                description: 'work',
                price: 2020,
                paid: true,
                paymentDate: '2020-08-15T19:11:26.737Z',
                ContractId: 1,
            }),
            Job.create({
                description: 'work',
                price: 200,
                paid: true,
                paymentDate: '2020-08-15T19:11:26.737Z',
                ContractId: 1,
            }),
            Job.create({
                description: 'work',
                price: 200,
                paid: true,
                paymentDate: '2020-08-16T19:11:26.737Z',
                ContractId: 1,
            }),
            Job.create({
                description: 'work',
                price: 200,
                paid: true,
                paymentDate: '2020-08-17T19:11:26.737Z',
                ContractId: 1,
            }),
            Job.create({
                description: 'work',
                price: 200,
                paid: true,
                paymentDate: '2020-08-17T19:11:26.737Z',
                ContractId: 1,
            }),
            Job.create({
                description: 'work',
                price: 21,
                paid: true,
                paymentDate: '2020-08-10T19:11:26.737Z',
                ContractId: 1,
            }),
            Job.create({
                description: 'work',
                price: 21,
                paid: true,
                paymentDate: '2020-08-15T19:11:26.737Z',
                ContractId: 1,
            }),
        ])

    })
    describe('GET /admin/best-profession', () => {
        it('should get the best profession within the given date range', async () => {
            const startDate = '2023-01-01';
            const endDate = '2023-12-31';

            const res = await chai.request(app).get(`/admin/best-profession?start=${startDate}&end=${endDate}`).set('profile_id', 1)

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('best_profession');
            expect(res.body).to.have.property('earnings');
        });

        it('should handle invalid date range and return an error', async () => {
            const startDate = 'invalid_start_date';
            const endDate = 'invalid_end_date';

            const res = await chai.request(app).get(`/admin/best-profession?start=${startDate}&end=${endDate}`).set('profile_id', 1)

            expect(res).to.have.status(500);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('error', 'Internal Server Error');
        });
    });

    describe('GET /admin/best-clients', () => {
        it('should get the best clients within the given date range', async () => {
            const startDate = '2023-01-01';
            const endDate = '2023-12-31';
            const limit = 5;

            const res = await chai.request(app).get(`/admin/best-clients?start=${startDate}&end=${endDate}&limit=${limit}`).set('profile_id', 1)

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('best_clients');
            expect(res.body.best_clients).to.be.an('array');
            expect(res.body.best_clients).to.have.lengthOf.at.most(limit);
        });

        it('should handle invalid date range and return an error', async () => {
            const startDate = 'invalid_start_date';
            const endDate = 'invalid_end_date';
            const limit = 5;

            const res = await chai.request(app).get(`/admin/best-clients?start=${startDate}&end=${endDate}&limit=${limit}`).set('profile_id', 1)

            expect(res).to.have.status(500);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('error', 'Internal Server Error');
        });
    });
})