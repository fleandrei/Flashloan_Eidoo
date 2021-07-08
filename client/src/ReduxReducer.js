const initialState = {
  accounts: null,
  web3: null,
  FlashLoan: null,
  Assets:[],               //List of all assets considered by the LendingPool
  Current_Asset_Index: 0,   //Index of the current Asset in the Assets array.
  Performed_Flash_Loan:[]
}

export default function rootReducer(state = initialState, action) {
  switch (action.type) {
    case "CONNECT_METAMASK": // We are connected to metamask and all eeded resources have been loaded.
      console.log("Metamask connect");
      return {
        ...state,
        web3: action.payload.web3,
        accounts: [...action.payload.accounts],
        FlashLoan: action.payload.FlashLoan,
        Assets: [...action.payload.Assets]
      }

    case "CHANGE_BALANCE": // The balance of MyFlashLoan_V2 contract corresponding to an asset (registered in state.Assets) has changed.
      var New_Assets = [...state.Assets];
      var comp=0;
      while(New_Assets[comp].Address!=action.payload.asset_address){
        comp++;
      }
      console.log("amount type:",typeof action.payload.amount,", balance type:", typeof New_Assets[comp].Balance)
      New_Assets[comp].Balance += action.payload.amount;
      return {
        ...state,
        Assets: New_Assets
      }

    case "CHANGE_ASSET": // The current asset has been changed
      return {
        ...state,
        Current_Asset_Index: action.payload.Current_Asset_Index
      }

    case "NEW_FLASHLOAN": // New flashLoan performed
      var New_Performed_Flash_Loan= [...state.Performed_Flash_Loan];
      New_Performed_Flash_Loan.push(action.payload);
      return {
        ...state,
        Performed_Flash_Loan: New_Performed_Flash_Loan
      }

    case "HIDE_FLASHLOAN_TOAST": // Hide the toast corresponding to action.payload.index performed Flashloan
      var New_Performed_Flash_Loan= [...state.Performed_Flash_Loan];
      New_Performed_Flash_Loan[action.payload.index].show=false;
      return {
        ...state,
        Performed_Flash_Loan: New_Performed_Flash_Loan
    }
      

    default:
      return state
  }
}