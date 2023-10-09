sudo docker-compose down -v
sudo docker system prune 
sudo docker volume prune
# # sudo ../fabric-samples/test-network/network.sh down
# # sudo ../fabric-samples/test-network/network.sh up createChannel -c mychannel -ca -s couchdb
# # sudo ../fabric-samples/test-network/network.sh deployCC -ccn secured -ccp ../asset-transfer-secured-agreement/chaincode-go/ -ccl go -ccep "OR('Org1MSP.peer','Org2MSP.peer')"



# code .
sudo rm -r organizations
echo "Remove "

# now go and start the network using fabcar 