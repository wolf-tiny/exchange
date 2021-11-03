import './assets/css/App.css';
import React, { useState, useEffect, useCallback } from "react";

import Input from './component/Input';
import Value from './component/Value';

const dot4 = (value, count = 4) => {
  return Math.floor(value * Math.pow(10, count)) / Math.pow(10, count);
}

const App = () => {

  const [arrWallet, setArrWallet] = useState([
    { name: 'USD', value: 200, character: '$' },
    { name: 'EUR', value: 150, character: '€' },
    { name: 'GBP', value: 10, character: '£' }
  ]);
  const [arrCalc, setArrCalc] = useState([
    { name: 'USD', value: 0, character: '$' },
    { name: 'EUR', value: 0, character: '€' },
    { name: 'GBP', value: 0, character: '£' }
  ]);
  const [objectRate, setObjectRate] = useState({
    original: { name: 'USD', value: 0 },
    transform: { name: 'EUR', value: 0 }
  });
  const [rate, setRate] = useState(0);
  const [titleRate, setTitleRate] = useState('');
  const [isOver, setIsOver] = useState(true);

  const onInit = () => {
    setArrCalc(list => list.map(item => {
      return { ...item, value: 0 }
    }))
    setIsOver(true);
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
  }, [arrWallet])

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
      onRate('USD', 'EUR');
    }
  }, [onRate, arrWallet])

  const handleChangeSelect = (type) => (e) => {
    let other = type === 'original' ? 'transform' : 'original';

    onRate(type === 'transform' ? objectRate['original'].name : e.target.value,
      type === 'transform' ? e.target.value : objectRate['transform'].name)

    setObjectRate({
      ...objectRate,
      [type]: {
        ...objectRate[type],
        name: e.target.value,
        value: 0
      },
      [other]: {
        ...objectRate[other],
        value: 0
      }
    })
  }

  const handleChangeInput = (type) => (e) => {
    if (!arrWallet[0].rate) return

    let value = parseFloat(e.target.value === '' ? 0 : e.target.value);
    let other = type === 'original' ? 'transform' : 'original';
    let otherValue = dot4(type === 'original' ? value * rate : value / rate);
    let selectWallet = arrWallet.find(item => item.name === objectRate[type].name);
    let otherWallet = arrWallet.find(item => item.name === objectRate[other].name);
    let impossible = (arrWallet.find(item => item.name === objectRate['original'].name).value < (type === 'original' ? value : otherValue));

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

    if (!impossible) {
      setArrCalc(list => list.map(item => {
        if (item.name === objectRate[type].name) {
          return { ...item, value: dot4(type === 'original' ? selectWallet.value - value : selectWallet.value + value, 2) }
        } else if (item.name === objectRate[other].name) {
          return { ...item, value: dot4(type === 'original' ? otherWallet.value + otherValue : otherWallet.value - otherValue, 2) }
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
      return {...item, value: val === 0 ? item.value : val}
    }))

    onInit()

    setObjectRate({
      ...objectRate,
      original: {
        ...objectRate['original'],
        value: 0
      },
      transform: {
        ...objectRate['transform'],
        value: 0
      }
    })
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
          <div className="effect"/>
        </div>
      </div>
    </div>
  );
}

export default App;
