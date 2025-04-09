import React from 'react';

const TotalSummery = ({ totalRiel, totalAfterPayment }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th style={{width: '5%'}}></th>
                    <th style={{width: '40%'}}></th>
                    <th style={{width: '10%'}}></th>
                    <th style={{width: '15%', borderRight: '1px solid black'}}>
                        <div className='d-flex flex-column text-end p-2'>
                            <label>Total</label>
                            <label>Grand total (5% tax)</label>
                            <label>Grand total in USD</label>
                            <label>Exchange rate 1 USD=</label>
                        </div>
                    </th>
                    <th style={{width: '15%'}}>
                        <div className='d-flex flex-column text-end p-2'>
                            <label>{totalRiel.toLocaleString()} R</label>
                            <label>{(totalRiel).toLocaleString()} R</label>
                            <label>{(totalAfterPayment).toFixed(2)} $</label>
                            <label>4 000 R</label>
                        </div>
                    </th>
                    <th style={{width: '15%'}}></th>
                </tr>
            </thead>
        </table>
    );
};

export default TotalSummery;
