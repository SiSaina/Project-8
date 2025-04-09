import styles from './page.module.css';

const InvoiceTable = ({ currentInvoice, handleViewInvoice, handlePrintInvoice, handleEditInvoice, confirmDeleteInvoice }) => {
    return (
        <table className="w-100 table table-bordered table-hover mt-3">
            <thead>
                <tr>
                    <th style={{ width: '35%' }}>Action</th>
                    <th style={{ width: '10%' }}>Invoice No.</th>
                    <th style={{ width: '5%' }}>Date</th>
                    <th style={{ width: '5%' }}>Due date</th>
                    <th style={{ width: '15%' }}>Customer</th>
                    <th style={{ width: '10%' }}>Amount</th>
                    <th style={{ width: '10%' }}>Amount paid</th>
                    <th style={{ width: '10%' }}>Amount due</th>
                    <th style={{ width: '5%' }}>Status</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(currentInvoice) && currentInvoice.length > 0 ? (
                    currentInvoice.map((i) => {
                        return (
                            <tr key={i.id}>
                                <td>
                                    <div className="d-flex gap-3">
                                        <button className={styles.button} onClick={() => handleViewInvoice(i.id)}>&#10011; View</button>
                                        <button className={styles.button} onClick={() => handlePrintInvoice(i)}>&#10011; Print-out</button>
                                        <button className={styles.buttonEdit} onClick={() => handleEditInvoice(i.id)}>Edit</button>
                                        <button className={styles.buttonDelete} onClick={() => confirmDeleteInvoice(i.id)}>Remove</button>
                                    </div>
                                </td>
                                <td>{i.id}</td>
                                <td>{new Date(i.date).toLocaleDateString()}</td>
                                <td>{new Date(i.dueDate).toLocaleDateString()}</td>
                                <td>{i.customer?.customerName || "Unknown"}</td>
                                <td>${i.amount.toFixed(2)}</td>
                                <td>${i.amountPaid.toFixed(2)}</td>
                                <td>${i.amountDue.toFixed(2)}</td>
                                <td>{i.invoiceStatus}</td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan="9">No invoices available.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default InvoiceTable;
