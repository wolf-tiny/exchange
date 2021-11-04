import React from 'react';

const Value = ({ wallet, calc }) => {

  return (
    <div className="value">
      <table>
        <thead>
          <tr>
            {wallet.map(item => <th key={item.name}>{item.name}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr className="real">
            {wallet.map(item => <td key={item.name}>{item.character + item.value}</td>)}
          </tr>
          <tr className="virtual">
            {calc.map(item => <td key={item.name}>
              {item.character + item.value }
            </td>)}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Value;