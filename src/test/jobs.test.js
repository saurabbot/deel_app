const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { sequelize, Profile, Contract, Job } = require('../model');
const { Op } = require('sequelize')


const { expect } = chai;
chai.use(chaiHttp);
chai.should();
describe('Jobs', () => {
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
    describe('/GET Unpaid Jobs', () => {
        it('should get all the unpaid jobs of the user calling the api', async () => {
            const profile = await Profile.findOne()
            const res = await chai.request(app).get('/jobs/unpaid').set('profile_id', profile.id);
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('all_unpaid_jobs');
            expect(res.body.all_unpaid_jobs).to.be.an('array');
            res.body.all_unpaid_jobs.forEach((job) => {
                expect(job.paid).to.equal(null);
                expect(job.ContractId).to.be.a('number');
            })
        })
    })
    describe('/POST pay', () => {
        it('client needs to pay amount to contractor for a job', async () => {
            const profile = await Profile.findOne({
                where: {
                    type: 'client'
                }
            });
            const unpaidJob = await Job.findOne({
                where: {
                    paid: false || null
                }
            });
            const res = await chai.request(app)
                .post(`/jobs/${unpaidJob.id}/pay`)
                .set('profile_id', profile.id);
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', true);
            const updatedJob = await Job.findByPk(unpaidJob.id);
            expect(updatedJob.paid).to.be.true;
            setTimeout(async () => {
                const secondResponse = await chai.request(app)
                    .post(`/jobs/${unpaidJob.id}/pay`)
                    .set('profile_id', profile.id);
                expect(secondResponse).to.have.status(404);
                expect(secondResponse.body).to.be.an('object');
                expect(secondResponse.body).to.have.property('success', false);
            }, 1000)


        });
    });

})