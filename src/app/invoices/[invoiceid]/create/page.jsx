'use client'
import { use, useEffect, useState } from 'react';
import styles from '../../../page.module.css';
import { useRouter } from 'next/navigation';
import { invoiceGet, invoiceUpdate, quotationGet, invoiceDelete, quotationGetAllNull, 
    quotationItemDelete, quotationGetByInvoiceId, itemGet, 
    quotationUpdate} from '@/actions/actions';
import ItemModal from '@/app/components/ItemModal';
import ItemDetailModal from '@/app/components/ItemDetailModal';
import CustomerModal from '@/app/components/CustomerModal';
import { InvoiceStatus } from '@prisma/client';
import TotalSummery from '@/app/components/TotalSummery';
import ItemTable from '@/app/components/ItemTable';

export default function create({params}) {
    //modal
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
    //object
    const [invoice, setInvoice] = useState(null);
    const [items, setItems] = useState([]);
    const [quotations, setQuotations] = useState([]);
    //selected item
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedQuotationItem, setSelectedQuotationItem] = useState('');
    const [isEditQuotationItem, setIsEditQuotationItem] = useState(false);

    const router = useRouter();
    const unwrappedParams = use(params);
    const { invoiceid } = unwrappedParams;

    const totalUSD = selectedQuotation?.QuotationItems?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const totalWithTax = totalUSD * 1.05;
    const totalAfterPayment = totalWithTax - (invoice?.amountPaid || 0);
    const totalRiel = totalAfterPayment * 4000;

    const fetchInvoice = async () => {
        try{
            const fetchedInvoice = await invoiceGet(parseInt(invoiceid));
            setInvoice(fetchedInvoice);
        } catch(error){
            console.error("Error fetching invoice:", error);
        }
    };
    const fetchOneQuotation = async () => {
        try{
            const fetchedQuotation = await quotationGetByInvoiceId(parseInt(invoiceid));
            setSelectedQuotation(fetchedQuotation);
            setQuotations(prevQuotations => {
                if (fetchedQuotation && !prevQuotations.some(q => q.id === fetchedQuotation.id)) {
                    return [...prevQuotations, fetchedQuotation];
                }
                return prevQuotations;
            });
        } catch(error){
            console.error("Error fetching quotation:", error);
        }
    };  
    const fetchAllQuotation = async () => {
        try{
            const fetchedQuotation = await quotationGetAllNull();
            setQuotations(fetchedQuotation);
        } catch(error){
            console.error("Error fetching items:", error);
        }
    };
    const fetchItems = async () => {
        try {
            const items = await itemGet();
            setItems(items);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };
    useEffect(() => {
        fetchItems();
        fetchAllQuotation();
        if(invoiceid){
            fetchInvoice();
        }
        fetchOneQuotation();
    }, [invoiceid]);
    const handleAddNewCustomer = async () => {
        const updated = await customerGetAll();
        setCustomers(updated);
    };
    const handleItemChange = (e) => {
        const itemId = e.target.value;
        if (itemId) {
            const selected = items.find(item => item.id === parseInt(itemId));
            setSelectedItem(selected);
        } else {
            setSelectedItem('');
        }
    };
    const handleQuotationChange = (e) => {
        const quotationId = e.target.value;
        if(quotationId) {
            const selected = quotations.find(quotation => quotation.id === parseInt(quotationId));
            setSelectedQuotation(selected);
        } else {
            setSelectedQuotation(null);
        }
    };
    const handleAddItem = async () => {
        const updated = await quotationGet(selectedQuotation.id);
        setSelectedQuotation(updated);
    };
    const handleAddNewItem = async () => {
        const updated = await itemGet();
        setItems(updated);
    }
    const handleCreateInvoice = async () => {
        try{
            const validation = handleValidation();
            if (!validation.isValid) {
                alert(validation.message);
                return;
            }
            let AmountPaid = Number(invoice?.amountPaid || 0);
            let AmountDue = Number(totalAfterPayment);
            if (invoice.invoiceStatus === "Paid") {
                AmountPaid = Number(totalWithTax);
                AmountDue = 0;
            }
            const Data = {
                date: new Date(invoice.date),
                dueDate: new Date(invoice.dueDate),
                amount: Number(totalWithTax),
                amountPaid: AmountPaid,
                amountDue: AmountDue,
                invoiceStatus: invoice.invoiceStatus,
                customerId: selectedQuotation.customer?.id || null,
                quotationId: selectedQuotation?.id || null
            }
            const quotationData = {
                quotationStatus: "Approved",
                customerStatus: "Approved",
                invoiceId: invoice.id,
                customerId: selectedQuotation.customer?.id || null,
            }
            await quotationUpdate(selectedQuotation.id, quotationData);
            await invoiceUpdate(invoice.id, Data);
            router.push('/invoices');
        } catch(error) {
            alert("Error creating invoice: " + error.message);
        }
    };
    const handleCancel = async () => {
        try {
            if (invoice.customer !== null) {
                router.push('/invoices');
            } else {
                await invoiceDelete(invoice.id);
                router.push('/invoices');
            }
        } catch(error) {
            alert("Error deleting invoice: " + error.message);
        }
    };
    const handleAddItemDetail = async () => { 
        if (!selectedQuotation) {
            alert("Please select an quotation first!");
            return;
        }
        setSelectedQuotationItem(null);
        setIsEditQuotationItem(false);
        setIsItemDetailModalOpen(true);
    };
    const handleEditItemDetail = async (item) => {
        setSelectedItem(item.item);
        setSelectedQuotationItem(item);
        setIsEditQuotationItem(true);
        setIsItemDetailModalOpen(true);
    };
    const handleRemoveItemDetail = async (item) => {
        try {
            await quotationItemDelete(item.id);
            const updated = await quotationGet(selectedQuotation.id);
            setSelectedQuotation(updated);
        } catch (error) {
            alert("Error removing item: " + error.message);
        }
    };
    const handleValidation = () => {
        if (!invoice?.date || !invoice?.dueDate) return { isValid: false, message: "Please select a date!" };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(invoice.date);
        const dueDate = new Date(invoice.dueDate);
        if (dueDate < date) return { isValid: false, message: "Due date cannot be less than date" };
        if (!invoice?.customer && (date < today || dueDate < today)) return { isValid: false, message: "Date cannot be less than today!" };
        if (!selectedQuotation) return { isValid: false, message: "Please select a quotation." };
        if (!selectedQuotation?.QuotationItems || selectedQuotation.QuotationItems.length === 0) return { isValid: false, message: "Please add at least one item!" };
        if (isNaN(invoice.amountPaid) || invoice.amountPaid < 0) return { isValid: false, message: "Please enter a valid Payment amount." };
        if (invoice.amount < invoice.amountPaid) return { isValid: false, message: "The payment is over extended." };
        return { isValid: true, message: "" };
    };
    return (
        <>
            <div className={styles.container}>
                <div className={styles.fullWidthGroup}>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Quotation No</label>
                            <select className={styles.input} value={selectedQuotation?.id || ''} onChange={handleQuotationChange} required>
                                <option value=''>Select a quotation</option>
                                {quotations.map((q) => (
                                    <option key={q.id} value={q.id}>
                                        {q.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Address</label>
                            <input className={styles.input} value={selectedQuotation?.customer?.address ?? ''} readOnly/>
                        </div>
                    </div>
                </div>
                <div className={styles.fullWidthGroup}>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Invoice No</label>
                            <input className={styles.input} value={invoice ? invoice.id : "Loading..."} readOnly/>
                        </div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Phone</label>
                            <input className={styles.input} value={selectedQuotation?.customer?.phone ?? ''} readOnly/>
                        </div>
                    </div>
                </div>
                <div className={styles.fullWidthGroup}>
                    <div className={styles.column}>
                    <div className={styles.inputGroup}>
                        <label className={styles.labelGroup}>Date</label>
                        <input 
                            className={styles.input} 
                            type="date" 
                            value={invoice ? new Date(invoice.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setInvoice({...invoice, date: e.target.value})}
                        />
                    </div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Due date</label>
                            <input 
                                className={styles.input} 
                                type="date" 
                                value={invoice ? new Date(invoice.dueDate).toISOString().split('T')[0] : ''} 
                                onChange={(e) => setInvoice({...invoice, dueDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.fullWidthGroup}>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Payment $</label>
                            <input className={styles.input} value={invoice ? invoice.amountPaid : ''} onChange={(e) => setInvoice({...invoice, amountPaid: e.target.value})}/>
                        </div>
                    </div>
                    {invoice && invoice.customer && (
                        <div className={styles.column}>
                            <div className={styles.inputGroup}>
                                <label className={styles.labelGroup}>Status</label>
                                <select 
                                    className={styles.input} 
                                    value={invoice.invoiceStatus} 
                                    onChange={(e) => setInvoice({...invoice, invoiceStatus: e.target.value})}
                                >
                                    {Object.values(InvoiceStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.fullWidthGroup}>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Customer/Organization</label>
                            <input className={styles.input} value={selectedQuotation?.customer?.customerName ?? ''} readOnly/>    
                            <button className={styles.button} onClick={() => setIsCustomerModalOpen(true)}>&#10011; Add new customer</button>
                        </div>
                    </div>
                </div>
                <div className={styles.fullWidthGroup}>
                    <label className={styles.labelGroup}>Item</label>
                    <select className={styles.inputTwo} value={selectedItem?.id || ''} onChange={handleItemChange} required>
                        <option value=''>Select an item</option>
                        {items.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.itemName}
                            </option>
                        ))}
                    </select>
                    <button className={styles.button} onClick={handleAddItemDetail}>&#10011; Add Item</button>
                    <button className={styles.button} onClick={() => setIsItemModalOpen(true)}>&#10011; Add new item</button>
                </div>
            </div>
            <div className={styles.containerTable}>
                <ItemTable 
                    selectedQuotation={selectedQuotation}
                    handleEditItemDetail={handleEditItemDetail}
                    handleRemoveItemDetail={handleRemoveItemDetail}
                />
                <TotalSummery totalRiel={totalRiel} totalAfterPayment={totalAfterPayment}/>
                <div className='w-50'>
                    <div>
                        <div className={styles.term}>Terms and Conditions</div>
                        <div className={styles.termText}>
                            <span>Full payment is required upon quote acceptance.</span>
                            <br />
                            <span>This quote is negotiable for one (1) week from the date stated above.</span>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center gap-4 '>
                        <button className={styles.button} onClick={handleCreateInvoice}>Submit request for approval</button>
                        <button className={styles.buttonCancel} onClick={handleCancel}>Cancel</button>
                    </div> 
                </div>
                <div style={{height: "200px"}}></div>
                <CustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onCustomerAdded={handleAddNewCustomer}/>
                <ItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onItemAdded={handleAddNewItem}/>
                <ItemDetailModal
                    isOpen={isItemDetailModalOpen} 
                    onClose={() => setIsItemDetailModalOpen(false)}
                    onQuotationItemAdded={handleAddItem}
                    selectedItem={selectedItem} 
                    quotation={selectedQuotation}
                    isEditQuotationItem={isEditQuotationItem}
                    selectedQuotationItem={selectedQuotationItem}/>
            </div>
        </>
    );
}
