import './assets/css/App.css';
import './assets/css/icons.css';
import React, { useState, useEffect, useCallback } from "react";
import Modal from 'react-modal';

import Web3 from "web3";
import Web3Modal from "web3modal";

import Input from './component/Input';
import Value from './component/Value';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
  overlay: {
    background: "#000000b0"
  }
};

const dot4 = (value, count = 4) => {
  return Math.floor(value * Math.pow(10, count)) / Math.pow(10, count);
}

const App = () => {

  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [balance, setBalance] = useState('');
  const [web3, setWeb3] = useState(new Web3(Web3.givenProvider));

  const [isModalConnect, setIsModalConnect] = useState(false);
  const [isModalWallet, setIsModalWallet] = useState(false);

  const [arrWallet, setArrWallet] = useState([
    { name: 'USD', value: 200, character: '$' },
    { name: 'EUR', value: 150, character: '€' },
    { name: 'GBP', value: 10, character: '£' }
  ]);
  const [arrCalc, setArrCalc] = useState([
    { name: 'USD', value: 200, character: '$' },
    { name: 'EUR', value: 150, character: '€' },
    { name: 'GBP', value: 10, character: '£' }
  ]);
  const [objectRate, setObjectRate] = useState({
    original: { name: 'USD', value: 0 },
    transform: { name: 'EUR', value: 0 }
  });
  const [rate, setRate] = useState(0);
  const [titleRate, setTitleRate] = useState('');
  const [isOver, setIsOver] = useState(true);

  const onInit = useCallback(() => {
    setArrCalc(list => list.map(item => {
      return { ...item, value: arrWallet.find(temp => temp.name === item.name).value }
    }))
    setIsOver(true);
  }, [arrWallet])

  const providerOptions = {
  };

  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions
  });

  const onInitInput = () => {
    setObjectRate({
      ...objectRate,
      original: {
        ...objectRate.original,
        value: 0
      },
      transform: {
        ...objectRate.transform,
        value: 0
      }
    })
  }

  const onRate = useCallback((origin, trans) => {
    let original = arrWallet.find(item => item.name === origin);
    let transform = arrWallet.find(item => item.name === trans);
    let temp = 0;

    if (origin === 'USD') {
      temp = transform.rate;
    } else {
      temp = dot4(transform.rate / original.rate);
    }

    setTitleRate(original.character + '1 = ' + transform.character + temp);
    setRate(temp);

    onInit()
  }, [arrWallet, onInit])

  useEffect(() => {
    fetch('https://cdn.moneyconvert.net/api/latest.json')
      .then(result => result.json())
      .then(res => {
        setArrWallet(list => list.map(item => {
          return { ...item, name: item.name, rate: dot4(res.rates[item.name]) }
        }))
      }).catch(err => {
        console.log(err)
      });

  }, [])

  useEffect(() => {
    if (arrWallet[0].rate) {
      onRate(objectRate.original.name, objectRate.transform.name);
    }
  }, [onRate, arrWallet, objectRate.original.name, objectRate.transform.name])

  const handleChangeSelect = (type) => (e) => {
    let other = type === 'original' ? 'transform' : 'original';
    let otherName = arrWallet.filter(item => item.name !== e.target.value)[0].name;

    onRate(type === 'transform' ? objectRate.original.name : e.target.value,
      type === 'transform' ? e.target.value : otherName)

    setObjectRate({
      ...objectRate,
      [type]: {
        ...objectRate[type],
        name: e.target.value,
        value: 0
      },
      [other]: {
        ...objectRate[other],
        name: type === 'original' ? otherName : objectRate[other].name,
        value: 0
      }
    })
  }

  const handleChangeInput = (type) => (e) => {
    if (!arrWallet[0].rate) return;

    let value = parseFloat(e.target.value === '' ? 0 : Math.abs(e.target.value));
    let other = type === 'original' ? 'transform' : 'original';
    let otherValue = dot4(type === 'original' ? value * rate : value / rate);
    let selectWallet = arrWallet.find(item => item.name === objectRate[type].name);
    let otherWallet = arrWallet.find(item => item.name === objectRate[other].name);
    let impossible = (arrWallet.find(item =>
      item.name === objectRate.original.name).value < (type === 'original' ?
        value : otherValue));

    setIsOver(impossible)

    setObjectRate({
      ...objectRate,
      [type]: {
        ...objectRate[type],
        value: value
      },
      [other]: {
        ...objectRate[other],
        value: otherValue
      }
    })

    if (!impossible && e.target.value !== '') {
      setArrCalc(list => list.map(item => {
        if (item.name === objectRate[type].name) {
          return {
            ...item, value: dot4(type === 'original' ?
              selectWallet.value - value : selectWallet.value + value, 2)
          }
        } else if (item.name === objectRate[other].name) {
          return {
            ...item, value: dot4(type === 'original' ?
              otherWallet.value + otherValue : otherWallet.value - otherValue, 2)
          }
        } else {
          return item
        }
      }))
    } else {
      onInit()
    }
  }

  const handleChange = () => {
    if (isOver) return;

    setArrWallet(list => list.map(item => {
      let val = arrCalc.find(temp => temp.name === item.name).value;
      return { ...item, value: val }
    }))

    onInit();
    onInitInput();
  }

  const handleConnect = () => {
    if (account === '') {
      setIsModalConnect(true);
    } else {
      setIsModalWallet(true);
    }
  }

  const handleWallet = async () => {
    connectPrompt()
  }

  const handleDisconnect = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    web3Modal.clearCachedProvider();
    setAccount('');
    setBalance('');
    setChainId('');
    
    setIsModalConnect(true);
    setIsModalWallet(false);
  }

  async function connectPrompt() {
    const provider = await web3Modal.connect();

    setWeb3(new Web3(provider));
    const firstAccount = await web3.eth.getAccounts().then(data => data[0]);
    const chain = await web3.eth.getChainId();
    const bal = await web3.eth.getBalance(firstAccount);
    setAccount(firstAccount);
    setChainId(chain);
    setBalance(bal);
    setIsModalConnect(false);
    setIsModalWallet(true);
  }

  return (
    <div className="app" translate="no">
      <div className="app-body">
        <div className="ex-body">
          <div className="title">
            <p>e-app<span>{titleRate}</span></p>
          </div>
          <div className="exchange">
            <Value wallet={arrWallet} calc={arrCalc} />
            {Object.keys(objectRate).map(item => {
              return <Input
                key={item}
                arr={arrWallet}
                cls={item}
                over={isOver}
                handle={handleChangeSelect}
                change={handleChangeInput}
                object={objectRate} />
            })}
          </div>
          <div className="button">
            <button onClick={handleChange} className={isOver ? 'disable' : ''}>
              exchange
            </button>
          </div>
          <div className="wallet">
            <button onClick={handleConnect}>
              <i className={'mdi mdi-wallet'} />
            </button>
          </div>
          <div className="effect" />
          <div className="effect-bottom" />
        </div>
      </div>
      <Modal
        isOpen={isModalConnect}
        onRequestClose={() => { setIsModalConnect(false) }}
        style={customStyles}
        contentLabel="Connect Modal"
      >
        <h4>Wallet details</h4>
        <p className="warning">Wallet not connected. Please click the "Connect"button below</p>
        <div className="modal-buttons">
          <button onClick={() => { setIsModalConnect(false) }}>Cancel</button>
          <button onClick={() => { handleWallet() }}>Connect</button>
        </div>
      </Modal>
      <Modal
        isOpen={isModalWallet}
        onRequestClose={() => { setIsModalWallet(false) }}
        style={customStyles}
        contentLabel="Wallet Modal"
      >
        <h4>Wallet details</h4>
        <div className="wallet-info">
          <div>
            <p>key</p>
            <p>value</p>
          </div>
          <div>
            <p>Account</p>
            <p>{account}</p>
          </div>
          <div>
            <p>Chain ID</p>
            <p>{chainId}</p>
          </div>
          <div>
            <p>Balance</p>
            <p>{balance}</p>
          </div>
        </div>
        <div className="modal-buttons">
          <button onClick={() => { setIsModalWallet(false) }}>Cancel</button>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
