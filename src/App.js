import logo from './blockdemy.svg';
import './App.css';
import Web3 from 'web3/dist/web3.min';
import ABI from './ABI.js';
import { useState } from 'react';

function App() {
  const CONTRACT_ADDRESS = "0x7767158169C871645075ce9CdeA470038ee38aBB";
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState(null);
  const [costOf, setCostOf] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transaction, setTransaction] = useState(null);

  const connectToMetamask = async() => {
    if(typeof window.ethereum !== 'undefined') {
      // tienes metamask
      const wallet = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      setWallet(wallet)
      getContractInstance(window.ethereum, ABI, CONTRACT_ADDRESS, wallet);
    } else {
      // necesitas instalar metamask
      alert("Install metamask")
    }
  }

  const getContractInstance = async(provider, ABI, CONTRACT_ADDRESS, wallet) => {
    try {
      const web3 = new Web3(provider);
      const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      setContract(contract);
      getContractName(contract);
      getCostOf(contract, 1);
      getEthPrice(contract);
      getBalanceOf(contract, wallet[0]);
    } catch(error) {
      console.error(error);
      setContract(null);
    }
  };

  const getContractName = async(contract) => {
    const name = await contract.methods.name().call();
    console.log(name);
    setName(name);
  };

  // call
  // getCostOf
  const getCostOf = async(contract, amount) => {
    const getCostOf = (await contract.methods.getCost(amount).call())  * 10 ** -8;
    setCostOf(getCostOf);
    return getCostOf;
  };

  // getEthPrice
  const getEthPrice = async(contract) => {
    const getEthPrice = await contract.methods.getOnlyEthPrice().call();
    setEthPrice(getEthPrice * 10 ** -8);
    return getEthPrice;
  };
  
  // getBalanceOf
  const getBalanceOf = async(contract, address) => {
    const balance = (await contract.methods.balanceOf(address).call()) * 10 ** -18;
    setBalance(balance);
  };

  // transaction
  // sell tokens
  const sellTokens = async(amount) => {
    let cost = await getCostOf(contract, amount);
    const web3 = new Web3(window.ethereum);
    cost = await web3.utils.toWei(cost.toString(), 'ether');
    console.log(cost);
    const transaction = await contract.methods.sellTokens(amount).send({
      from: wallet[0], value: cost
    });
    setTransaction(transaction)
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {
          wallet ? (
            <button id="ConnectToWallet">Conectado a Wallet</button>
          ) : (
            <button onClick={()=>{connectToMetamask()}} id="ConnectToWallet">Conectar a Metamask</button>
          )
        }
      </header>
      {
        wallet ? (
          <div id="container">
            <div id="message">
              <h1>
                Con nuestro <span>{name}</span> se parte de nuestra comunidad
              </h1>
              <h1><span>contribuyendo a la evangelización de Blockchain en México</span></h1>
            </div>
            <div id="boxDetails">
              <p>
                Contrato: <span>{CONTRACT_ADDRESS}</span>
              </p>
              <p>
                Mi cuenta: <span>{wallet[0]}</span>
              </p>
              <p>
                Balance: <span>{balance}</span>
              </p>
              <p>
                Ether Price: $<span>{ethPrice} USD</span>
              </p>
              <p>
                Token Cost: <span>{costOf} ETH</span>
              </p>

              {transaction ? (<a href={'https://rinkeby.etherscan.io/tx/' + transaction.transactionHash}>Ver transacción en Etherscan</a>) : ("")}

              <button onClick={()=>{sellTokens(1)}}>
                Comprar un token
              </button>
            </div>
          </div>
        ) : (
          <div id="noWallet">
            <h1>Por favor conecta con tu Wallet</h1>
          </div>
        )
      }
    </div>
  );
}

export default App;
