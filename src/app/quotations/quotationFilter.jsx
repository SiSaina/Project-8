import styles from "./page.module.css";
export default function QuotationFilters({ quotationStatus, setQuotationStatus, customerStatus, setCustomerStatus, onCreateQuotation }) {
    return (
        <div className={styles.row}>
            <button className={styles.button} onClick={onCreateQuotation}>Issue Quotation</button>
            <div>
                <label>Customer status:</label>
                <select className={styles.select} value={customerStatus} onChange={(e) => setCustomerStatus(e.target.value)}>
                    {["All", "Default", "Pending", "Approved", "Revise", "Sent", "Rejected"].map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Quotation status:</label>
                <select className={styles.select} value={quotationStatus} onChange={(e) => setQuotationStatus(e.target.value)}>
                    {["All", "Default", "Pending", "Approved", "Revise", "Rejected"].map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}