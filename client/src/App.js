import React, { Component, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'; 
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Toast from 'react-bootstrap/Toast';
import ToastHeader from 'react-bootstrap/ToastHeader'


import 'bootstrap/dist/css/bootstrap.min.css';




import "./App.css";

function AssetAddress2Symbol(address, Assets){
  var comp=0;
  while(Assets[comp].Address!=address){
    comp++;
  }
  return Assets[comp].Symbol;
}

function Connect_Metamask({}){

  const Dispatch = useDispatch();
  const web3 = useSelector(state => state.web3);
  const FlashLoan = useSelector(state => state.FlashLoan);
  const Assets = useSelector(state => state.Assets);
  const Current_Asset_Index = useSelector(state => state.Current_Asset_Index);

  const Handle_Flashloan_Event = async(err, ev)=>{
    if(err){
      alert("Handle_Flashloan_Event event error. Check console for details");
      console.error(err);
    }else{
      var amount = ev.returnValues.amount;
      var fee = ev.returnValues.fee;
      var Asset_Address= ev.returnValues.asset;
      if(fee>0){
        Dispatch({type:"CHANGE_BALANCE", payload:{asset_address:Asset_Address, amount:parseInt(-fee)}})
      }
      Dispatch({type:"NEW_FLASHLOAN", payload:{amount:amount, fee:fee, address:Asset_Address, show:true}});
      
    }
  }

  const Handle_Fund = async(err, ev, asset_address, FlashLoan_address)=>{
    if(err){
      alert("Handle_Fund event error. Check console for details");
      console.error(err);
    }else{
      var to = ev.returnValues.to;
      var from = ev.returnValues.from;
      if(to==FlashLoan_address){
        var amount = ev.returnValues.value;
        console.log("ev.returnValues.values:",ev.returnValues.amount);
        Dispatch({type:"CHANGE_BALANCE", payload:{asset_address:asset_address, amount:parseInt(amount)}});
      }
      if(from==FlashLoan_address){
        var amount = ev.returnValues.value;
        console.log("ev.returnValues.values:",ev.returnValues.amount);
        Dispatch({type:"CHANGE_BALANCE", payload:{asset_address:asset_address, amount:parseInt(-amount)}});
      }
      
      
    }
  }

  const OnConnectMetamask=()=>{
    //const web3 = await getWeb3();
    Dispatch({type:'CONNECT', Event_Handlers:{Handle_Flashloan_Event:Handle_Flashloan_Event, Handle_Fund:Handle_Fund}})
  }

  if(web3==null){
    return(
    <div>
      <Button variant="danger" onClick={OnConnectMetamask}>
            connect MetaMask
      </Button>
    </div>
    )
  }else{
    return(
      <div>
      <Button variant="secondary" disabled>
            connected
      </Button>
    </div>
    )
    
  }
  
}





function Asset({}){
  const Dispatch = useDispatch();
  const web3 = useSelector(state => state.web3);
  const Assets = useSelector(state => state.Assets);
  const Current_Asset_Index = useSelector(state => state.Current_Asset_Index);
  const FlashLoan = useSelector(state=>state.FlashLoan);
  const accounts = useSelector(state=>state.accounts);

  console.log("\nAssets:",Assets, ", \n Current_Asset_Index:",Current_Asset_Index);

  const Handle_Submit= async (event)=>{
    var form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    console.log("\nFlashLoan:",FlashLoan)
    console.log("\nSubmit_Handler: form:", form);
    try{
      await Assets[Current_Asset_Index].Instance.methods.transfer(FlashLoan._address, form[5].value).send({from:accounts[0]});
    }catch(error){
      alert("Couldn't transfer token, Check console for details.")
      console.error(error);
    }
    //Dispatch({type:"FUND", payload:{value:}})
  }

  const Handle_Select= async(event)=>{
    Dispatch({type:"CHANGE_ASSET", payload:{Current_Asset_Index:event.currentTarget.value}})
  }

  return(
    <div style={{display: 'flex', justifyContent: 'center'}}>
     <Card className="d-flex" style={{ width: '70rem' }}>
      <Card.Header><strong>Asset</strong></Card.Header>
          <Card.Body>
            <Form onSubmit={Handle_Submit}>
              <Row>
                
                <Col>
                  <Form.Group>
                  <Form.Label htmlFor="SelectAsset">Select an asset</Form.Label>
                  <Form.Control as="select" onChange={Handle_Select} id="SelectAssets" disabled={web3==null} >
                  {Assets.map((asset, index)=>{
                    return <option key={index.toString()} value={index.toString()}> {asset.Symbol} </option>
                    })}
                  </Form.Control>
                  </Form.Group>
                </Col>

                <Col sm={3} className="align-items-end">
                  <Form.Label htmlFor="copy_address">Copy Address</Form.Label>
                  
                  {
                    (Assets.length>0)?<div>
                  
                        <OverlayTrigger
                        trigger="click"
                        key="Asset_Address"
                        delay={{show:100, hide: 100 }}
                        placement={"bottom"}
                        
                        overlay={
                        <Tooltip id={'tooltip_Asset_Address'}>
                        <strong>Copied</strong>.
                        </Tooltip>
                         }
                      > 
                      <Button id="copy_address" variant="info" onClick={()=>{navigator.clipboard.writeText(Assets[Current_Asset_Index].Address)}}>{Assets[Current_Asset_Index].Address.slice(0,8)+"..."+Assets[Current_Asset_Index].Address.slice(36)+" "}</Button>

                    </OverlayTrigger>

                    </div> : <Button id="copy_address" variant="secondary" disabled >0x000000...000000</Button>    
                }
                
                
                 
                </Col>

                <Col sm={2}>
                  <Form.Label >Amount</Form.Label>
                  <Form.Control type="text" placeholder={(Assets.length != 0)? Assets[Current_Asset_Index].Balance : 0} disabled/>
                </Col>
              </Row>

              <br/>

              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  Fund the contract:
                </Form.Label>
                <Col sm={5}>
                  <Form.Control disabled={web3==null} />
                </Col>
                <Col>
                  <Button type="submit" disabled={web3==null}>Fund</Button>
                </Col>
              </Form.Group>

            </Form>
            
          </Card.Body>
          </Card>
    </div>
    )
}






function MyFlashLoan({}){
  const [showToast, SetshowToast]= useState(true);
  const Dispatch = useDispatch();
  const web3 = useSelector(state => state.web3);
  const Assets = useSelector(state => state.Assets);
  const Current_Asset_Index = useSelector(state => state.Current_Asset_Index);
  const FlashLoan = useSelector(state=>state.FlashLoan);
  const accounts = useSelector(state=>state.accounts);
  const Performed_Flash_Loan = useSelector(state=>state.Performed_Flash_Loan);

  const Handle_Submit= async (event)=>{
    var form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    console.log("Submit_Handler: form:", form);
    console.log("\nAddress:", Assets[Current_Asset_Index].Address);

    try{
      await FlashLoan.methods.myFlashLoanCall(Assets[Current_Asset_Index].Address, form[0].value).send({from:accounts[0]}); 
    }catch(error){
      alert("Couldn't perform flashloan, check the console for more details");
      console.error(error);
    }
    
  }

  const Handle_Close = async (index)=>{
    Dispatch({type:"HIDE_FLASHLOAN_TOAST", payload:{index:index}});
  }

  return(
    <div>
    <div style={{display: 'flex', justifyContent: 'center'}}>
     <Card className="d-flex" style={{ width: '70rem' }}>
      <Card.Header><strong>FlashLoan</strong></Card.Header>
          <Card.Body>
            
            <Form onSubmit={Handle_Submit}>
              <Form.Group as={Row} >
                <Form.Label column sm={3}>
                  FlashLoan amount:
                </Form.Label>
                <Col sm={5}>
                  <Form.Control disabled={web3==null} />
                </Col>
                <Col>
                  <Button type="submit" disabled={web3==null}>Submit</Button>
                </Col>
              </Form.Group>

            </Form>

            
          </Card.Body>
          </Card>

          <br/>
          <br/>
          <br/>

          
    </div>
    <div style={{
      position: 'relative',
      minHeight: '200px',
    }}>

      <div  style={{
            position: 'absolute',
            top: 20,
            right: 0,
          }}>
      {
        Performed_Flash_Loan.map((elem, index)=>{
          return(
              <Toast key={index} show={elem.show} onClose={()=>{Handle_Close(index)}} >
            <Toast.Header  className="justify-content-between "  >
              {AssetAddress2Symbol(elem.address, Assets)}
              <strong className="mr-auto">FlashLoan performed</strong>
              
            </Toast.Header>
            <Toast.Body className="justify-content-start " >
              <ul className="justify-content-start ">
                <li><strong>Amount:</strong> {elem.amount}</li>
                <li><strong>Fee:</strong> {elem.fee}</li>
                <li><strong>Address:</strong> {elem.address}</li>
              </ul>
              
            </Toast.Body>
          </Toast >
            )
        })
        }
     
          </div>
        </div>
    </div>
    )
}



class App extends Component {
  
  
  render() {
    
    return (
      <div className="App">
        <h1>FlashLoan </h1>
        <h5>(On Kovan)</h5>
        <br/>
        <Connect_Metamask/>
        <br/>
        <br/>
        <Asset/>
        <br/>
        <MyFlashLoan/>
        
      </div>
    );
  }
}

export default App;
