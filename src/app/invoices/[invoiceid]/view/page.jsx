'use client'
import { use, useEffect, useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { invoiceGet} from '@/actions/actions';

export default function create({params}) {
    const [invoice, setInvoice] = useState(null);
    const router = useRouter();
    const unwrappedParams = use(params);
    const { invoiceid } = unwrappedParams;

    const TAX_RATE = 0.05;
    const EXCHANGE_RATE = 4000;
    
    const subtotalUSD = invoice?.quotation?.QuotationItems?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const taxUSD = subtotalUSD * TAX_RATE;
    const totalWithTaxUSD = subtotalUSD + taxUSD;
    const amountPaidUSD = invoice?.amountPaid || 0;
    const balanceDueUSD = totalWithTaxUSD - amountPaidUSD;
    const balanceDueRiel = balanceDueUSD * EXCHANGE_RATE;
    

    const fetchInvoice = async () => {
        try{
            const fetchedInvoice = await invoiceGet(parseInt(invoiceid));
            setInvoice(fetchedInvoice);
        } catch(error){
            console.error("Error fetching invoice:", error);
        }
    };
    useEffect(() => {
        if(invoiceid){
            fetchInvoice();
        }
    }, [invoiceid]);
    const handleBack = async () => {
        router.push('/invoices');
    };
    return (
        <div className={styles.receiptContainer}>
            <div className={styles.header}>
                <h2>INVOICE RECEIPT</h2>
                <span>Invoice No: {invoice?.id || 'Loading...'}</span><br />
                <span>Date: {invoice ? new Date(invoice.date).toLocaleDateString() : ''}</span>
            </div>

            <div className={styles.customerInfo}>
                <div><strong>Customer:</strong> {invoice?.customer?.customerName || 'Loading...'}</div>
                <div><strong>Phone:</strong> {invoice?.customer?.phone || '-'}</div>
                <div><strong>Address:</strong> {invoice?.customer?.address || '-'}</div>
                <div><strong>Date:</strong> {invoice ? new Date(invoice?.date).toLocaleDateString() : '-'}</div>
                <div><strong>Due Date:</strong> {invoice ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</div>
                <div><strong>Status:</strong> {invoice?.invoiceStatus || '-'}</div>
                <div><strong>Quotation ID:</strong> {invoice?.quotation?.id || '-'}</div>
            </div>

            <table className={styles.itemTable}>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Unit Price ($)</th>
                        <th>Subtotal ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice?.quotation?.QuotationItems?.length > 0 ? (
                        invoice.quotation.QuotationItems.map((i, index) => (
                            <tr key={i.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <div>{i.item.itemName}</div>
                                    <div className={styles.description}>{i.item.description}</div>
                                    <div className={styles.remark}>{i.remark}</div>
                                </td>
                                <td>{i.quantity}</td>
                                <td>{i.unit || 'Unit'}</td>
                                <td>{i.price.toFixed(2)}</td>
                                <td>{(i.quantity * i.price).toFixed(2)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className={styles.noItems}>No items available yet</td></tr>
                    )}
                </tbody>
            </table>

            <div className={styles.totals}>
                <div><strong>Subtotal (USD):</strong> {subtotalUSD.toFixed(2)} $</div>
                <div><strong>Tax (5%):</strong> {taxUSD.toFixed(2)} $</div>
                <div><strong>Total (USD):</strong> {totalWithTaxUSD.toFixed(2)} $</div>
                <div><strong>Amount Paid:</strong> {amountPaidUSD.toFixed(2)} $</div>
                <div><strong>Balance Due (USD):</strong> {balanceDueUSD.toFixed(2)} $</div>
                <div><strong>Balance Due (KHR):</strong> {balanceDueRiel.toLocaleString()} R</div>
            </div>

            <div className={styles.terms}>
                <h4>Terms and Conditions</h4>
                <p>Payment due upon receipt of invoice.</p>
                <p>This invoice is valid for 7 days from the date above.</p>
            </div>

            <div className={styles.footer}>
                <button onClick={handleBack} className={styles.backButton}>Back</button>
            </div>
        </div>
    );
}
