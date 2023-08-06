const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { sequelize, Profile, Contract } = require('../model');
const { Op } = require('sequelize')


const { expect } = chai;
chai.use(chaiHttp);
chai.should();
describe('Contracts', () => {
    before(async () => {
        await sequelize.sync({ force: true });
        const profile = await Profile.create({
            id: 21,
            firstName: 'John',
            lastName: 'Doe',
            profession: 'Client',
            balance: 1000.0,
            type: 'client',
        });
        await Profile.create({
            id: 20,
            firstName: 'John',
            lastName: 'Lenon',
            profession: 'Musician',
            balance: 64,
            type: 'contractor'
        })
        await Contract.create({
            id: 88,
            terms: 'Some terms',
            status: 'in_progress',
            ClientId: profile.id,
            ContractorId: 20,
        });

    });
    describe('/GET contracts', () => {
        it('should GET all the contracts of the user passed in the header', async () => {
            const profile = await Profile.findOne();
            const res = await chai.request(app)
                .get('/contracts')
                .set('profile_id', profile.id);
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('allContracts');
            expect(res.body.allContracts).to.be.an('array');
            res.body.allContracts.forEach((contract) => {
                expect(contract.ContractorId || contract.ClientId).to.equal(profile.id);
            });
        });
    });
    describe('/GET contracts/:id', () => {
        it('should get details of a specific contract', async () => {
            const profile = await Profile.findOne();
            const contract = await Contract.findOne();
            const res = await chai.request(app)
                .get(`/contracts/${contract.id}`)
                .set('profile_id', profile.id);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('foundContract');
            expect(res.body.foundContract).to.be.an('object');
            expect(res.body.foundContract.id).to.equal(contract.id)
            expect(res.body.foundContract.ContractorId || res.body.foundContract.ClientId).to.equal(profile.id)
        });
    });
});