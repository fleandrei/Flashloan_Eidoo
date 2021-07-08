# Flashloan_Eidoo

## Presentation

In this project, we use AAVE V2 to get a flashloan on Kovan testnet. This is implemented in the __MyFlashLoan_V2.sol__ smart contract. It allows the user to get a flashloan using any asset supported by the Kovan Lendingpool, however we will focus on DAI (0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD on kovan).
 


## Testing

Smart contract unit tests are coded in the _FlashLoan_Test.js_ script.

To test the smart contract _MyFlashLoan_V2.sol_, we have to fork the kovan testnet in order to have access to AAVE and Dai contracts. 
We do so by using ganache-cli:

`ganache-cli --fork https://kovan.infura.io/v3/<Infua_Key> -i 42 --unlock 0x97045b2FAB7a709C5C8E946A8896b5EaeBCE08fC`

the unlocked address (0x97045b2FAB7a709C5C8E946A8896b5EaeBCE08fC) is an account that hold Kovan Dai token. It is used by the test script to fund _MyFlashLoan_V2.sol_ smart contract.


## Deployed Address

The MyFlashLoan_V2 contract is deployed on Kovan testnet at 0x5476f3243c29387935585979c7949945ac179649.



## Dapp interaction

To interact with the Dapp:

* In the client folder, launch the server: 
`npm run start`
* Click on _connect Metamask_ button to connect to Metamask provider. This step may take a few seconds.
* On the first form, select the asset you wnt to perform a flash loan on
* You may need to fund the MyFlashLoan_V2 contract with liquidty in order to be able to perform the flashloan
* On the second form, enter the amount you want to borrow and perform the flashloan. A Toast should pop up on the rigth side and confirm your flashloan has been performed correctly.
