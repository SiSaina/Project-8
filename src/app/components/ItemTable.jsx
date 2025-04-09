import React from 'react';
import styles from '../page.module.css';

const ItemTable = ({ selectedQuotation, handleEditItemDetail, handleRemoveItemDetail }) => {
    return (
        <table className="table table-bordered table-hover">
            <thead className='table-dark'>
                <tr>
                    <th style={{width: '5%'}}>No.</th>
                    <th style={{width: '30%'}}>ITEM</th>
                    <th style={{width: '10%'}}>Quantity</th>
                    <th style={{width: '10%'}}>Unit</th>
                    <th style={{width: '15%'}}>Unit Price</th>
                    <th style={{width: '15%'}}>SUB-TOTAL</th>
                    <th style={{width: '15%'}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {selectedQuotation && selectedQuotation.QuotationItems && selectedQuotation.QuotationItems.length > 0 ? (
                    selectedQuotation.QuotationItems.map((i, index) => (
                        <tr key={i.id} className="text-center align-middle">
                            <td>{index + 1}</td>
                            <td>
                                <div className="d-flex flex-column">
                                    <span>{i.item.itemName}</span>
                                    <span className='opacity-50'>{i.item.description}</span>
                                    <span className='opacity-50'>{i.remark}</span>
                                </div>
                            </td>
                            <td>{i.quantity}</td>
                            <td>{i.unit || 'Unit'}</td>
                            <td>{i.price} $</td>
                            <td>{(i.quantity * i.price).toFixed(2)} $</td>
                            <td>
                                <div className="d-flex gap-2">
                                    <button className={styles.buttonEdit} onClick={() => handleEditItemDetail(i)}>Edit</button>
                                    <button className={styles.buttonDelete} onClick={() => handleRemoveItemDetail(i)}>Remove</button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="9" className="text-center">No items available yet</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default ItemTable;
