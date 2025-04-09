
import styles from "./page.module.css";
export default function InvoiceFilter({ invoiceStatus, setInvoiceStatus, onCreateInvoice }) {
    return (
        <div className={styles.row}>
            <button className={styles.button} onClick={onCreateInvoice}>Issue Invoice</button>
            <div>
                <label>Filter by:</label>
                <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)} className={styles.select}>
                    <option value="Default">Default</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="All">All</option>
                </select>
            </div>
        </div>
    );
}