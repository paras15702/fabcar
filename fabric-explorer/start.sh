# #First run the test network so that the organisations folder is created 

sudo cp -r ../fabric-samples/test-network/organizations .
# echo "Copied"
sudo chmod 777 organizations

sudo ls organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/ >> ./connection-profile/test-network.json 

code ./connection-profile/test-network.json

# sleep 35s

echo "Welcome Back, running in 10s"

sleep 10

export EXPLORER_CONFIG_FILE_PATH=./config.json
export EXPLORER_PROFILE_DIR_PATH=./connection-profile
export FABRIC_CRYPTO_PATH=./organizations



