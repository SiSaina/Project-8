'use client';
import styles from './page.module.css';
import { use, useEffect, useState } from 'react';
import { quotationGet } from '@/actions/actions';
import { useRouter } from 'next/navigation';


export default function create({params}) {
    const [quotation, setQuotation] = useState(null);
    const router = useRouter();
    const unwrappedParams = use(params);
    const { quotationid } = unwrappedParams;
    
    const totalUSD = quotation?.QuotationItems?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const totalRiel = totalUSD * 4000;

    const fetchQuotation = async () => {
        const fetchedQuotation = await quotationGet(parseInt(quotationid));
        setQuotation(fetchedQuotation);
    };
    useEffect(() => {
        if (quotationid) {
            fetchQuotation();
        }
    }, [quotationid]);
    const handleBack = async () => {
        router.push('/quotations');
    };

    return (
        <div className={styles.receiptContainer}>
          <div className={styles.header}>
            <h2>QUOTATION RECEIPT</h2>
            <span>Quotation No: {quotation?.id || 'Loading...'}</span>
            <br/>
            <span>Date: {quotation ? new Date(quotation.date).toLocaleDateString() : ''}</span>
          </div>
    
          <div className={styles.customerInfo}>
            <div><strong>Customer:</strong> {quotation?.customer?.customerName || 'Loading...'}</div>
            <div><strong>Phone:</strong> {quotation?.customer?.phone || '-'}</div>
            <div><strong>Address:</strong> {quotation?.customer?.address || '-'}</div>
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
              {quotation?.QuotationItems?.length > 0 ? (
                quotation.QuotationItems.map((i, index) => (
                  <tr key={i.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div>{i.item.itemName}</div>
                      <div className={styles.description}>{i.item.description}</div>
                      <div className={styles.remark}>{i.remark}</div>
                    </td>
                    <td>{i.quantity}</td>
                    <td>{i.unit || 'Unit'}</td>
                    <td>{i.price}</td>
                    <td>{(i.quantity * i.price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className={styles.noItems}>No items available yet</td></tr>
              )}
            </tbody>
          </table>
    
          <div className={styles.totals}>
            <div><strong>Total (USD):</strong> {totalUSD.toFixed(2)} $</div>
            <div><strong>Total (KHR):</strong> {totalRiel.toLocaleString()} R</div>
            <div><strong>+ 5% Tax (KHR):</strong> {(totalRiel * 1.05).toLocaleString()} R</div>
            <div><strong>Grand Total (USD):</strong> {(totalUSD * 1.05).toFixed(2)} $</div>
          </div>
    
          <div className={styles.terms}>
            <h4>Terms and Conditions</h4>
            <p>Full payment is required upon quote acceptance.</p>
            <p>This quote is negotiable for one (1) week from the date stated above.</p>
          </div>
    
          <div className={styles.footer}>
            <button onClick={handleBack} className={styles.backButton}>Back</button>
          </div>
        </div>
      );
}
