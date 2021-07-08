import { call, put, takeEvery, takeLatest, all} from 'redux-saga/effects'
import FlashLoanContract from "./contracts/MyFlashLoan_V2.json";
import ILendingPool from "./contracts/ILendingPool.json";
import IERC20Metadata from "./contracts/IERC20Metadata.json";

import getWeb3 from "./getWeb3";


/*This generator initiate an instance of an ERC20.
It return an object containing this instance and other informations (address, symbol and MyFlashLoan_V2 balance)*/
function* Init_ERC20(asset_address, FlashLoan_address, web3, Handle_Transfer){
	let ERC20 = new web3.eth.Contract(
      		IERC20Metadata.abi,
      		asset_address
      	)
      	//let symbol = yield call(ERC20.methods.symbol.call);
      	console.log("\n ERC20:",ERC20);
      	console.log("\n Handle_Transfer:",Handle_Transfer);
      	let balance = yield call(ERC20.methods.balanceOf(FlashLoan_address).call);
      	let symbol = yield call(ERC20.methods.symbol().call);
      	ERC20.events.Transfer(async (err,ev)=>{await Handle_Transfer(err,ev,asset_address, FlashLoan_address)});
      	return {Instance:ERC20, Address:asset_address, Balance:parseInt(balance,10), Symbol:symbol};
}


/*This generator handle connection to metamask and loading all needed ressources.
 Event_Handlers parameter is an object containing functions used to handle contracts events
*/
function* Connect_Metamask(action) {
	
   try {
   		console.log("ReduxSaga: Connect_Metamask ");
      // Get network provider and web3 instance.
      const web3 = yield call(getWeb3);
      console.log("web3:", web3);
      // Use web3 to get the user's accounts.
      const accounts = yield call(web3.eth.getAccounts);
      console.log("\n Accounts:",accounts)
      
      // Get current network 
      const networkId = yield call(web3.eth.net.getId);
      console.log("\n networkId:",networkId);
      const deployedNetwork = FlashLoanContract.networks[networkId];

      if(deployedNetwork==null){ //  If the contract is not deployed on the current network
      	throw("The MyFlashLoan_V2 contract is not deployed on this network");
      }
      // Get the MyFlashLoan_V2 contract instance.
      const FlashLoan = new web3.eth.Contract(
        FlashLoanContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      console.log("action.Event_Handlers:",action.Event_Handlers);

      //We listen "flashloan_event" emited by the contract when a flash loan has been performed
      FlashLoan.events.flashloan_event(action.Event_Handlers.Handle_Flashloan_Event);

      console.log("\n instance:",FlashLoan);

      const LengingPool_address = yield call(FlashLoan.methods.LENDING_POOL().call);
      console.log("\n lending_pool address:",LengingPool_address);
      //Get an instance of the LendingPool
      const lending_pool = new web3.eth.Contract(
      		ILendingPool.abi,
      		LengingPool_address
      	)
      console.log("\n lending_pool:",lending_pool);
      //Get the list of all assets we can use to make flash loan
      const ReserveList = yield call(lending_pool.methods.getReservesList().call);
      console.log("\n ReserveList:",ReserveList);
      console.log("\n Handle_Fund:", action.Event_Handlers.Handle_Fund);

      const Assets = yield all(ReserveList.map( asset_address=>call(Init_ERC20, asset_address, deployedNetwork.address, web3, action.Event_Handlers.Handle_Fund)));
      console.log("\n Assets:",Assets);

      //We send the CONNECT_METAMASK action to the reducer
      yield put({ type: 'CONNECT_METAMASK', payload: {web3:web3, accounts:accounts, FlashLoan:FlashLoan, Assets:Assets} });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
}




export default function* rootSaga() {
  yield takeEvery('CONNECT', Connect_Metamask);
 }