/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const cars = [
            {
                color: 'blue',
                make: 'Toyota',
                model: 'Prius',
                owner: 'Tomoko',
                mobile: '+918689919086',
                challans: [],

            },
            {
                color: 'red',
                make: 'Ford',
                model: 'Mustang',
                owner: 'Brad',
                mobile: '+918689919086',
                challans: [],
            },
            {
                color: 'green',
                make: 'Hyundai',
                model: 'Tucson',
                owner: 'Jin Soo',
                mobile: '+918689919086',
                challans: [],
            },
            
            
        ];

        for (let i = 0; i < cars.length; i++) {
            cars[i].docType = 'car';
            await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
            console.info('Added <--> ', cars[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCar(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async createCar(ctx, carNumber, make, model, color, owner,mobile) {
        console.info('============= START : Create Car ===========');

        const car = {
            color,
            docType: 'car',
            make,
            model,
            owner,
            mobile,
            challans,
            
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Car ===========');
    }

    async queryAllCars(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeCarOwner(ctx, carNumber, newOwner,newMobile) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;
        car.mobile = newMobile;
        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }


    async queryOverspeedCars(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            const carAsBytes = await ctx.stub.getState(key); // get the car from chaincode state
            if (!carAsBytes || carAsBytes.length === 0) {
                throw new Error(`${carNumber} does not exist`);
            }
            const car = JSON.parse(carAsBytes.toString());
            var speed = car.speed;
            try {
                if(speed>20){
                    record = JSON.parse(strValue);
                    allResults.push({ Key: key, Record: record });
                }
            } catch (err) {
                console.log(err);
            }
            
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }


    async changeCarSpeed(ctx, carNumber, newSpeed) {
       

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.speed = newSpeed;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        
    }

    // async addCarSpeed(ctx, carNumber, make, model, color, owner,speed) {
    //     console.info('============= START : Create Car ===========');

    //     const car = {
    //         color,
    //         docType: 'car',
    //         make,
    //         model,
    //         owner,
    //         speed,
            
    //     };

    //     await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
    //     console.info('============= END : Create Car ===========');
    // }

    async addCarSpeed(ctx,carNumber,speed) {
        const startKey = '';
        const endKey = '';
        
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            const carAsBytes = await ctx.stub.getState(key); // get the car from chaincode state
            if (!carAsBytes || carAsBytes.length === 0) {
                throw new Error(`${carNumber} does not exist`);
            }
            const c= JSON.parse(carAsBytes.toString());
            
            if(carNumber === key){
                const car = {
                    color : c.color,
                    docType: 'car',
                    make : c.make,
                    model : c.model,
                    owner : c.owner,
                    mobile:c.mobile,
                    challans : c.challans,
                    sensorID : c.sensorID,
                    speed,
                    
                    };
        
                await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
                }
            }
            
    }
        
    async addSensor(ctx,carNumber,sensorID) {
            const startKey = '';
            const endKey = '';
            
            for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
                const strValue = Buffer.from(value).toString('utf8');
                let record;
                const carAsBytes = await ctx.stub.getState(key); // get the car from chaincode state
                if (!carAsBytes || carAsBytes.length === 0) {
                    throw new Error(`${carNumber} does not exist`);
                }
                const c= JSON.parse(carAsBytes.toString());
                
                if(carNumber === key){
                    const car = {
                        color : c.color,
                        docType: 'car',
                        make : c.make,
                        model : c.model,
                        owner : c.owner,
                        mobile:c.mobile,
                        challans : c.challans,
                        speed : c.speed,
                        sensorID,
                        };
            
                    await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
                    }
            }
                
        }


        async changeCarSensor(ctx, carNumber, newSensorID) {
       

            const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
            if (!carAsBytes || carAsBytes.length === 0) {
                throw new Error(`${carNumber} does not exist`);
            }
            const car = JSON.parse(carAsBytes.toString());
            car.sensorID = newSensorID;
    
            await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
            
        }


        // async changeCarSpeed(ctx, carNumber, newSpeed) {
       

        //     const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        //     if (!carAsBytes || carAsBytes.length === 0) {
        //         throw new Error(`${carNumber} does not exist`);
        //     }
        //     const car = JSON.parse(carAsBytes.toString());
        //     car.speed = newSpeed;
    
        //     await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
            
        // }

        async addChallan(ctx, key,owner,make,mobile,challanId,f) {
       

            const carAsBytes = await ctx.stub.getState(key); // get the car from chaincode state
            if (!carAsBytes || carAsBytes.length === 0) {
                throw new Error(`${carNumber} does not exist`);
            }
            const car = JSON.parse(carAsBytes.toString());
            
            car.challans.push({
                carNumber : key,
                carOwner : owner,
                brand : make,
                contact:mobile,
                challanID : challanId,
                fine : f
            });
            
    
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(car)));
            
        }

        

    async getChallans(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }

        const car = JSON.parse(carAsBytes.toString());
        const allResults = car.challans
        return JSON.stringify({"res":allResults});
    }
        
           
    

}

module.exports = FabCar;
