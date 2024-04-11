var invoker = require('./invoke.js')
var queryF = require('./query.js')
var express = require('express')
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const util = require('util');
const FabricCAServices = require('fabric-ca-client');
const enrollAdmin = require('./enrollAdmin')
const jwt = require('jsonwebtoken');
const twilio = require('twilio')
const { PREFER_MSPID_SCOPE_ALLFORTX } = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies.js');
const { decode } = require('punycode');
const { get } = require('https');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var app = express()
const port = 4002

app.use(cookieParser());
app.use(express.json());
// const allowedOrigins = [
//     "http://192.168.35.184:3000",
//     "111.125.237.169",
//     "http://f273-103-197-221-179.ngrok-free.app"
//     // Add more origin URLs as needed
//   ];
// //   app.use(cors({ origin: allowedOrigins, credentials:true}));

// app.use(cors({
//     origin: allowedOrigins
// }));
const corsOptions = {
    origin: "http://f273-103-197-221-179.ngrok-free.app",
    methods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Access-Control-Allow-Origin'],
    credentials: true,
};

//app.use(cors(corsOptions));
app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
// Additional CORS headers
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', "http://192.168.35.184:3000");
//     res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//     next();
// });
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', "*");
//     res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

//     // res.status(200);

//     next();
// })

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//     });

const  verifyToken=(req, res, next)=> {
    const token = req.headers['authorization'];
    //const token = req.cookies['token']
    //const token = req.cookie['token'];
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }

    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Attach the decoded payload to the request for further processing
        req.username = decoded.username;
        req.orgName=decoded.orgName;
        next();
    });
}

// function fillChallanDetails(owner,make,key,mobile){

    
//     let c = {

//         challanId : "123",
//         ownerName : owner,
//         Brand : make,
//         carNumber : key,
//         contact : mobile,
//         fine : "Rs 2500"
//     }

//     return c

// }

let challandata

function generateChallan(data){
    let mobile = []
    let make = []
    let key = []
    
    let owner = []

    const firstObject = data[0];
    const keys = Object.keys(firstObject);

    for(i=0;i<keys.length;i++){
        mobile.push(data[i].Record.mobile)
        make.push(data[i].Record.make)
        key.push(data[i].Key)
        owner.push(data[i].Record.owner)
    }

    for(i=0;i<keys.length;i++){
    const client = new twilio('ACf9fbc2bbba9bf14fe490b78849876214','a752aa5e0a8db1719076194ecdcc2119')
    client.messages
    .create({
        body: owner[i] + " "+make[i]+" "+key[i],
        from: '+17204106917',
        to: mobile[i]
    })
    .then(message => console.log(message.sid))
    .catch(err => console.log(err));

    //fillChallanDetails(owner[i],make[i],key[i],mobile[i],data[i].Record.challans)

}



}

app.put('/addChallan',verifyToken,async(req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org2"){
        try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org2-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
       //await contract.submitTransaction('createCar', req.body.carNumber, req.body.make, req.body.model, req.body.color, req.body.owner);
       
       let data = challandata

       
       let mobile = []
       let make = []
       let key = []
       
       let owner = []
   
       const firstObject = data[0];
       const keys = Object.keys(firstObject);
   
       for(i=0;i<keys.length;i++){
           mobile.push(data[i].Record.mobile)
           make.push(data[i].Record.make)
           key.push(data[i].Key)
           owner.push(data[i].Record.owner)
       }
   
       for(i=0;i<keys.length;i++){
       await contract.submitTransaction('addChallan',key[i],owner[i],make[i],mobile[i],'CH123','RS 2500');}
        //await contract.submitTransaction('addCarSpeed', 'CAR1', 50);
       //await contract.submitTransaction('addSensor', 'CAR1', 'abc123456');
        //await contract.submitTransaction('changeCarSensor', 'CAR1', 'abc1234ghjkvbnml');
        console.log('Transaction has been submitted');
        res.send("speed updated");
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
if (orgName == "Org1"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}
})

app.get('/',async (req,res)=>{
    //var username = req.username
    //var orgName = req.orgName
    //if (orgName == "Org1"){
        try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("paras");
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: "paras", discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryAllCars');
        // const result = await contract.evaluateTransaction('queryOverspeedCars');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.json( {"result" : result.toString()});
        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
//}
//if (orgName == "Org2"){

    //res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
//}
    
})


app.post('/createCar/',verifyToken,async(req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
        try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
       await contract.submitTransaction('createCar', req.body.carNumber, req.body.make, req.body.model, req.body.color, req.body.owner,req.body.mobile);
       //await contract.submitTransaction('changeCarSpeed', 'CAR1', 19);
        //await contract.submitTransaction('addCarSpeed', 'CAR1', 50);
       //await contract.submitTransaction('addSensor', 'CAR1', 'abc123456');
        //await contract.submitTransaction('changeCarSensor', 'CAR1', 'abc1234ghjkvbnml');
        console.log('Transaction has been submitted');
        res.send("new car created");
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}
})

app.put('/addCarSpeed/:carNumber',verifyToken,async(req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
        try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
       //await contract.submitTransaction('createCar', req.body.carNumber, req.body.make, req.body.model, req.body.color, req.body.owner);
       //await contract.submitTransaction('changeCarSpeed', 'CAR3', req.body.speed);
        await contract.submitTransaction('addCarSpeed', req.params.carNumber , req.body.speed);
       //await contract.submitTransaction('addSensor', 'CAR1', 'abc123456');
        //await contract.submitTransaction('changeCarSensor', 'CAR1', 'abc1234ghjkvbnml');
        console.log('Transaction has been submitted');
        res.send("speed added ");
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}
})


app.put('/changeCarSpeed/:carNumber',verifyToken,async(req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
        try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
       //await contract.submitTransaction('createCar', req.body.carNumber, req.body.make, req.body.model, req.body.color, req.body.owner);
       await contract.submitTransaction('changeCarSpeed', req.params.carNumber, req.body.newSpeed);
        //await contract.submitTransaction('addCarSpeed', 'CAR1', 50);
       //await contract.submitTransaction('addSensor', 'CAR1', 'abc123456');
        //await contract.submitTransaction('changeCarSensor', 'CAR1', 'abc1234ghjkvbnml');
        console.log('Transaction has been submitted');
        res.send("speed updated");
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}
})

app.put('/addSensor/:carNumber',verifyToken,async(req,res)=>{
    
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'org1-wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get(username);
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');
    
            // Get the contract from the network.
            const contract = network.getContract('fabcar');
    
            // Submit the specified transaction.
            // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
           //await contract.submitTransaction('createCar', req.body.carNumber, req.body.make, req.body.model, req.body.color, req.body.owner);
           //await contract.submitTransaction('changeCarSpeed', 'CAR1', 19);
            //await contract.submitTransaction('addCarSpeed', 'CAR1', 50);
           await contract.submitTransaction('addSensor', req.params.carNumber ,req.body.sensorID);
            //await contract.submitTransaction('changeCarSensor', 'CAR1', 'abc1234ghjkvbnml');
            console.log('Transaction has been submitted');
            res.send("new sensor added to the car");
            // Disconnect from the gateway.
            await gateway.disconnect();
    
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}
})

app.put('/changeCarSensor/:carNumber',verifyToken,async(req,res)=>{

    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'org1-wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get(username);
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');
    
            // Get the contract from the network.
            const contract = network.getContract('fabcar');
    
            // Submit the specified transaction.
            // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
           //await contract.submitTransaction('createCar', req.body.carNumber, req.body.make, req.body.model, req.body.color, req.body.owner);
           //await contract.submitTransaction('changeCarSpeed', 'CAR1', 19);
            //await contract.submitTransaction('addCarSpeed', 'CAR1', 50);
           //await contract.submitTransaction('addSensor', req.params.carNumber ,req.body.sensorId);
            await contract.submitTransaction('changeCarSensor', req.params.carNumber, req.body.newSensorID);
            console.log('Transaction has been submitted');
            res.send("sensor changed ");
            // Disconnect from the gateway.
            await gateway.disconnect();
    
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}
    //----------------------------------------------------------
    
    //-------------------------------------------------------
})


app.put('/changeCarOwner/:carNumber',verifyToken, async(req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'org1-wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get(username);
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');
    
            // Get the contract from the network.
            const contract = network.getContract('fabcar');
    
            // Submit the specified transaction.
            // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
           //await contract.submitTransaction('createCar', req.body.carNumber, req.body.make, req.body.model, req.body.color, req.body.owner);
           //await contract.submitTransaction('changeCarSpeed', 'CAR1', 19);
            //await contract.submitTransaction('addCarSpeed', 'CAR1', 50);
           //await contract.submitTransaction('addSensor', req.params.carNumber ,req.body.sensorId);
            await contract.submitTransaction('changeCarOwner', req.params.carNumber, req.body.newOwner,req.body.newMobile);
            console.log('Transaction has been submitted');
            res.send("owner changed");
            // Disconnect from the gateway.
            await gateway.disconnect();
    
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}
    
    //------------------------------------------------------------------------------------------
    
    //----------------------------------------------------------------------------------------------------------------
})



app.get('/getCar/:carNumber',verifyToken,async (req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryCar',req.params.carNumber);
        // const result = await contract.evaluateTransaction('queryOverspeedCars');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.json( {"result" : result.toString()});
        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}

    
})



app.get('/getOverspeedCars',verifyToken,async (req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
    try {
        // load the network configuration
        
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user "appUserorg1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        //const result = await contract.evaluateTransaction('queryAllCars');
         const result = await contract.evaluateTransaction('queryOverspeedCars');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.json( {"result" : result.toString()});
        //let res = JSON.parse(result)
        // let speeds = []
        // const firstObject = JSON.parse(result)[0];


        // const keys = Object.keys(firstObject);
        // for (i=0 ;i<keys.length;i++){
        // console.log(JSON.parse(result)[i].Record.speed)}
        // console.log(speeds)
        generateChallan(JSON.parse(result))
        challandata = JSON.parse(result)
        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
    }
     

    if (orgName == "Org2"){

        res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
        // try {
        //     // load the network configuration
            
        //     const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        //     const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
        //     // Create a new file system based wallet for managing identities.
        //     const walletPath = path.join(process.cwd(), 'org2-wallet');
        //     const wallet = await Wallets.newFileSystemWallet(walletPath);
        //     console.log(`Wallet path: ${walletPath}`);
    
        //     // Check to see if we've already enrolled the user.
        //     const identity = await wallet.get(username);
        //     if (!identity) {
        //         console.log('An identity for the user "appUserorg2" does not exist in the wallet');
        //         console.log('Run the registerUser.js application before retrying');
        //         return;
        //     }
    
        //     // Create a new gateway for connecting to our peer node.
        //     const gateway = new Gateway();
        //     await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });
    
        //     // Get the network (channel) our contract is deployed to.
        //     const network = await gateway.getNetwork('mychannel');
    
        //     // Get the contract from the network.
        //     const contract = network.getContract('fabcar');
    
        //     // Evaluate the specified transaction.
        //     // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        //     // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        //     //const result = await contract.evaluateTransaction('queryAllCars');
        //      const result = await contract.evaluateTransaction('queryOverspeedCars');
        //     console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        //     res.json( {"result" : result.toString()});
        //     // Disconnect from the gateway.
        //     await gateway.disconnect();
            
        // } catch (error) {
        //     console.error(`Failed to evaluate transaction: ${error}`);
        //     process.exit(1);
        // }
    }
        
    
})


// app.get('/changeOwner/:landId/:newOwner/',async(req,res)=>{
//     // var result= await queryF.mainQuery().toString();
//     // res.send(queryF.mainQuery().toString());
    
//     invoker.mainInvoke(req.params.landId,req.params.newOwner);
//     res.send("success");
//     // console.log(queryF.mainQuery());
// })


// app.get('/create/:landId/:commercial/:isLoan/:assetValue/:ownerName/:taluka/:district/',async(req,res)=>{
//     // var result= await queryF.mainQuery().toString();
//     // res.send(queryF.mainQuery().toString());
    
//     invoker.mainInvoker(req.params.landId.toString(),req.params.commercial.toString(),req.params.isLoan.toString(),req.params.assetValue.toString(),req.params.ownerName.toString(),req.params.taluka.toString(),req.params.district.toString());
//     res.send("success");
//     // console.log(queryF.mainQuery());
// })


app.post('/user',async(req,res)=>{

    var username = req.body.username;
    var orgName = req.body.orgName;

    const getCCP = async (org) => {
        let ccpPath;
        if (org == "Org1") {
            ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    
        } else if (org == "Org2") {
            ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        } else
            return null
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = JSON.parse(ccpJSON);
        return ccp
    }
    
    const getCaUrl = async (org, ccp) => {
        let caURL;
        if (org == "Org1") {
            caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    
        } else if (org == "Org2") {
            caURL = ccp.certificateAuthorities['ca.org2.example.com'].url;
        } else
            return null
        return caURL
    
    }
    
    const getWalletPath = async (org) => {
        let walletPath;
        if (org == "Org1") {
            walletPath = path.join(process.cwd(), 'org1-wallet');
    
        } else if (org == "Org2") {
            walletPath = path.join(process.cwd(), 'org2-wallet');
        } else
            return null
        return walletPath
    
    }
    
    
    const getAffiliation = async (org) => {
        return org == "Org1" ? 'org1.department1' : 'org2.department1'
    }
    
    const getRegisteredUser = async (username, userOrg, isJson) => {
        let ccp = await getCCP(userOrg)
    
        const caURL = await getCaUrl(userOrg, ccp)
        const ca = new FabricCAServices(caURL);
    
        const walletPath = await getWalletPath(userOrg)
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    
        const userIdentity = await wallet.get(username);
        if (userIdentity) {
            console.log(`An identity for the user ${username} already exists in the wallet`);
            var response = {
                success: true,
                message: username + ' enrolled Successfully',
            };
            var token = jwt.sign({username,orgName},"secretKey",{expiresIn:"300s"})
            res.cookie("token",token)
            res.json({token})
            return response
        }
    
        // Check to see if we've already enrolled the admin user.
        let adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            await enrollAdmin(userOrg, ccp);
            adminIdentity = await wallet.get('admin');
            console.log("Admin Enrolled Successfully")
            
        }
    
        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');
        let secret;
        try {
            // Register the user, enroll the user, and import the new identity into the wallet.
            secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: username, role: 'client' }, adminUser);
            // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);
    
        } catch (error) {
            return error.message
        }
    
        const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });
        // const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret, attr_reqs: [{ name: 'role', optional: false }] });
    
        let x509Identity;
        if (userOrg == "Org1") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
        } else if (userOrg == "Org2") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org2MSP',
                type: 'X.509',
            };
        }

        // var token = jwt.sign({username,orgName},"secretKey",{expiresIn:"30000s"})
        // res.json({token})
        // res.cookie("token",token)
        await wallet.put(username, x509Identity);
        console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);
    
        var response = {
            success: true,
            message: username + ' enrolled Successfully',
        };
        
    }

    getRegisteredUser(username,orgName)

    const enrollAdmin = async (org, ccp) => {

        console.log('calling enroll Admin method')
    
        try {
    
            const caInfo = await getCaInfo(org, ccp) //ccp.certificateAuthorities['ca.org1.example.com'];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
    
            // Create a new file system based wallet for managing identities.
            const walletPath = await getWalletPath(org) //path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the admin user.
            const identity = await wallet.get('admin');
            if (identity) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }
    
            // Enroll the admin user, and import the new identity into the wallet.
            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            let x509Identity;
            if (org == "Org1") {
                x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                    },
                    mspId: 'Org1MSP',
                    type: 'X.509',
                };
            } else if (org == "Org2") {
                x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                    },
                    mspId: 'Org2MSP',
                    type: 'X.509',
                };
            }
    
            await wallet.put('admin', x509Identity);
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
            return
        } catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
        }
    }
    
    const getCaInfo = async (org, ccp) => {
        let caInfo
        if (org == "Org1") {
            caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    
        } else if (org == "Org2") {
            caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
        } else
            return null
        return caInfo
    
    }
    
    

})

// const secretKey = "secretKey";

// app.post("/tok",(req,resp)=>{

//     const user ={
//         id:1,
//         username:"paras",
//     }

//     jwt.sign({user},secretKey,{expiresIn:"300s"},(err,token)=>{
//         resp.json({
//             token
//         })
//     })
// })

app.get('/getChallans/:carNumber',verifyToken,async (req,res)=>{
    var username = req.username
    var orgName = req.orgName
    if (orgName == "Org1"){
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('getChallans',req.params.carNumber);
        // const result = await contract.evaluateTransaction('queryOverspeedCars');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.json( {"result" : result.toString()});
        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
if (orgName == "Org2"){

    res.json({"Authorization Error":"YOU do not belong to the organization that can view this data"})
}

    
})



app.listen(port,()=>{
    console.log("listening on port: ",port);
})
