// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "../installed_contracts/ILendingPool.sol";
import "../installed_contracts/FlashLoanReceiverBase.sol";
import "../installed_contracts/ILendingPoolAddressesProvider.sol";
//import "https://github.com/aave/protocol-v2/blob/master/contracts/protocol/libraries/types/DataTypes.sol";



contract MyFlashLoan_V2 is FlashLoanReceiverBase {
    
    constructor(address _addressProvider) FlashLoanReceiverBase(ILendingPoolAddressesProvider(_addressProvider)) public{}
    
    event flashloan_event(uint amount, uint fee, address asset);
    
    /**
    *  @dev Do a flash loan
       @param asset Address of the token we want to make a flash loan on. The address must be registered in the LendingPool reserve.
       @param amount Amount of token to lend. It must be non zero and less than MyFlashLoan_V2's contract balance in this token.
    */
    function myFlashLoanCall(address asset, uint amount) public {
        address receiverAddress = address(this);
        
        
        require(amount>0, "Amount is 0");
        require(LENDING_POOL.getReserveNormalizedVariableDebt(asset)>0, "Token not registered");
        require(IERC20(asset).balanceOf(receiverAddress) > amount, "Not enought funds");
        
        
        address[] memory assets = new address[](1);
        assets[0] = address(asset);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = address(this);
        bytes memory params = "";
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            onBehalfOf,
            params,
            referralCode
        );
    }
    
    
     /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    )
        external
        override
        returns (bool)
    {

        uint amountOwing = amounts[0].add(premiums[0]);
        IERC20(assets[0]).approve(address(LENDING_POOL), amountOwing);
        
        emit flashloan_event(amounts[0], premiums[0], assets[0]);
        
        return true;
    }
    
    /**
    *@notice Give the contract's balance of an asset.
    *@param asset Address of the asset
    *@return amount Balance 
     */
    function Token_Amount(address asset) external view returns(uint amount){
        return IERC20(asset).balanceOf(address(this));
    }
    
    
}
