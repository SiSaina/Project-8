import styles from "./page.module.css";
export default function QuotationTable({ quotations, onView, onPrint, onEdit, onDelete }) {
    return (
        <table className="w-100 table table-bordered table-hover mt-3">
            <thead>
                <tr>
                    <th style={{width: '30%'}}>Action</th>
                    <th style={{width: '5%'}}>NO.</th>
                    <th style={{width: '25%'}}>Customer / Organization name</th>
                    <th style={{width: '10%'}}>Date</th>
                    <th style={{width: '10%'}}>Total</th>
                    <th style={{width: '5%'}}>Status</th>
                    <th style={{width: '15%'}}>Customer status</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(quotations) && quotations.length > 0 ? (
                    quotations.map((q) => {
                        const totalUSD = q?.QuotationItems?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
                        const totalWithTax = totalUSD * 1.05;
                        return (
                            <tr key={q.id}>
                                <td>
                                    <div className="d-flex gap-3">
                                        <button className={styles.button} onClick={() => onView(q.id)}>View</button>
                                        <button className={styles.button} onClick={() => onPrint(q)} disabled={q.quotationStatus === "Pending"}>Print-out</button>
                                        <button className={styles.buttonEdit} onClick={() => onEdit(q.id)}>Edit</button>
                                        <button className={styles.buttonDelete} onClick={() => onDelete(q.id)}>Remove</button>
                                    </div>
                                </td>
                                <td>{q.id}</td>
                                <td>{q.customer?.customerName || "Unknown"}</td>
                                <td>{new Date(q.date).toLocaleDateString()}</td>
                                <td>${totalWithTax.toLocaleString()}</td>
                                <td>{q.quotationStatus || "Unknown"}</td>
                                <td>{q.customerStatus || "Unknown"}</td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan="7">No quotations available.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
