// Test of "MyFlashLoan_V2 contract"
const { BN, constants, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers'); // BN: Big Number
const { expect } = require('chai');
const MyFlashLoan_V2 = artifacts.require('MyFlashLoan_V2');
const IERC20 = artifacts.require('IERC20');




contract('TEST: MyFlashLoan_V2.sol', function(accounts){
	
	let FlashLoan_Instance;
	let Asset_Instance;
	
	const LendingPoolAddressProvider_address = "0x88757f2f99175387aB4C6a4b3067c77A695b0349"; // Address of LendingPoolAddressProvider on kovan.
	const Asset_address= "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD"; // Dai address on kovan used by the lending pool as reserve
	const Unregistered_ERC20_address = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"; //Another ERC20 token not registered in LendingPool reserves
	const Asset_Holder_Account = "0x97045b2fab7a709c5c8e946a8896b5eaebce08fc"; // Account that own some Dai token (used on aave) on Kovan
	const contract_balance = 1000000;
	const FlashLoan_Amount = 10000;


	beforeEach(async function () {
			FlashLoan_Instance = await MyFlashLoan_V2.new( LendingPoolAddressProvider_address);	
			Asset_Instance = await IERC20.at(Asset_address);
			await Asset_Instance.transfer(FlashLoan_Instance.address, contract_balance, {from:Asset_Holder_Account});
	});


	it("attempt to make flashloan with 0 amount", async function(){
			await expectRevert(FlashLoan_Instance.myFlashLoanCall(Asset_address,0), "Amount is 0");
	});

	it("attempt to make flashloan with amount equal or greater than balance", async function(){
			await expectRevert(FlashLoan_Instance.myFlashLoanCall(Asset_address,contract_balance), "Not enought funds");
	});

	it("attempt to make flashloan with asset address not registered", async function(){
			await expectRevert(FlashLoan_Instance.myFlashLoanCall(Unregistered_ERC20_address, FlashLoan_Amount), "Token not registered");
	});

	it("Make a successful flashloan", async function(){
			let res = await FlashLoan_Instance.myFlashLoanCall(Asset_address, FlashLoan_Amount);
			
			const expected_fee =  FlashLoan_Amount*9/10000;
			let Contract_Asset_Balance = await Asset_Instance.balanceOf(FlashLoan_Instance.address);

			expect(Contract_Asset_Balance).to.be.bignumber.equal(new BN(contract_balance - expected_fee));
			console.log("finale balance:",Contract_Asset_Balance, "expected_fee:",expected_fee);
			await expectEvent(res, "flashloan_event", {amount: new BN(FlashLoan_Amount), fee:new BN(expected_fee), asset:Asset_address}, "flashloan_event event incorrect");
	});
	

});





		
	