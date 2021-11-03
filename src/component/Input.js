import React from 'react';

const Input = ({ arr, cls, handle, change, object, over }) => {

  return (
    <div className="input">
      <select
        className={cls}
        onChange={handle(cls)}
        value={object[cls].name}>
        {arr.map(item => <option key={item.name}>{item.name}</option>)}
      </select>
      <div>
        <input
          className={over && cls === 'original' &&  object[cls].value !== 0 ? 'error' : ''}
          type="number"
          value={object[cls].value === 0 ? '' : object[cls].value}
          onChange={change(cls)} />
      </div>
    </div>
  )
}

export default Input;