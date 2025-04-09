'use client';
import styles from '../../../page.module.css';
import CustomerModal from '@/app/components/CustomerModal';
import ItemModal from '@/app/components/ItemModal';
import ItemDetailModal from '@/app/components/ItemDetailModal';
import { use, useEffect, useState } from 'react';
import { customerGetAll, customerGetByQuotationId, itemGet, quotationGet, quotationDelete, 
            quotationUpdate, quotationItemDelete, invoiceCreatePost, 
            invoiceUpdate} from '@/actions/actions';
import { useRouter } from 'next/navigation';
import { QuotationStatus, CustomerStatus, InvoiceStatus } from '@prisma/client';
import ItemTable from '@/app/components/ItemTable';
import TotalSummery from '@/app/components/TotalSummery';


export default function create({params}) {
    //modal
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
    //object
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [quotation, setQuotation] = useState(null);
    //selected item
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedQuotationItem, setSelectedQuotationItem] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditQuotationItem, setIsEditQuotationItem] = useState(false);
    //route
    const router = useRouter();
    const unwrappedParams = use(params);
    const { quotationid } = unwrappedParams;
    
    const totalUSD = quotation?.QuotationItems?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const totalRiel = totalUSD * 4000;
    const totalRielWithTax = totalRiel * 1.05;
    const totalUSDWithTax = totalUSD * 1.05;

    const fetchCustomers = async () => {
        try {
            const customers = await customerGetAll();
            setCustomers(customers);
        } catch (error) {
            console.error("Error fetching customers:", error);
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
    const fetchQuotation = async () => {
        try {
            const fetchedQuotation = await quotationGet(parseInt(quotationid));    
            setQuotation(fetchedQuotation);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };
    const fetchOneCustomer = async () => {
        try {
            const customer = await customerGetByQuotationId(parseInt(quotationid));
            setSelectedCustomer(customer);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };
    useEffect(() => {
        fetchCustomers();
        fetchItems();
        if (quotationid) {
            fetchQuotation();
        }
        fetchOneCustomer();
    }, [quotationid]);
    const handleCustomerChange = (event) => {
        const customerId = event.target.value;
        if (customerId) {
            const selected = customers.find(customer => customer.id === parseInt(customerId));
            setSelectedCustomer(selected);
        } else {
            setSelectedCustomer(null);
        }
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
    const handleCreateQuotation = async () => {
        try {
            const validation = handleValidateQuotation();
            if (!validation.isValid) {
                alert(validation.message);
                return;
            }
            if (quotation.customerStatus === "Approved") {
                quotation.quotationStatus = "Approved";
                quotation.customerStatus = "Approved";
            }
            const Data = {
                date: new Date(quotation.date),
                quotationStatus: quotation.quotationStatus,
                customerStatus: quotation.customerStatus,
                customerId: selectedCustomer?.id || null,
            };
            await quotationUpdate(quotation.id, Data);
            if (quotation.customerStatus === "Approved") {
                const invoiceData = {
                    date: new Date().toISOString(),
                    amount: totalUSDWithTax,
                    amountPaid: Number(0),
                    amountDue: totalUSDWithTax,
                    InvoiceStatus: 'Pending',
                    customerId: null,
                    quotationId: null
                };
                const newInvoiceData = {
                    customerId: selectedCustomer?.id,
                    quotationId: quotation?.id
                }
                const newInvoice = await invoiceCreatePost(invoiceData);
                await invoiceUpdate(newInvoice.id, newInvoiceData);
                router.push(`/invoices/${newInvoice.id}/create`);
            }
            if(quotation.customerStatus !== "Approved"){
                router.push('/quotations');
            }
        } catch (error) {
            alert("Error creating quotation: " + error.message);
        }
    };
    const handleCancel = async () => {
        try {
            if (selectedCustomer !== null && quotation.QuotationItems && quotation.QuotationItems.length > 0) {
                router.push('/quotations');
            } else {
                await quotationDelete(quotation.id);
                router.push('/quotations');
            }
        } catch (error) {
            alert('Error deleting quotation: ' + error.message);
        }
    };
    const handleRefreshCustomer = async () => {
        const updated = await customerGetAll();
        setCustomers(updated);
    };
    const handleRefreshNewItem = async () => {
        const updated = await itemGet();
        setItems(updated);
    };
    const handleRefreshItemDetail = async () => {
        const updated = await quotationGet(quotation.id);
        setQuotation(updated);
    };
    const handleAddItemDetail = async () => {
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
            const updated = await quotationGet(quotation.id);
            setQuotation(updated);
        } catch (error) {
            alert("Error removing item: " + error.message);
        }
    };
    const handleValidateQuotation = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!quotation?.date) return { isValid: false, message: "Please select a date!" };
        if (!quotation?.QuotationItems || quotation.QuotationItems.length === 0) return { isValid: false, message: "Please add at least one item!" };
        if (!quotation?.customer && (new Date(quotation.date) < today)) return { isValid: false, message: "Date cannot be less than today!" };
        if (!selectedCustomer?.id) return { isValid: false, message: "Please select a customer!" };
        return { isValid: true, message: "" };
    };
    return (
        <>
            <div className={styles.container}>
                <div className={styles.row}>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Quotation No</label>
                            <input className={styles.input} value={quotation ? quotation.id : 'Loading...'} readOnly />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Address</label>
                            <input className={styles.input} value={selectedCustomer?.address ?? ''} readOnly/>
                        </div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Date</label>
                            <input 
                                className={styles.input} 
                                type="date" 
                                value={quotation ? new Date(quotation.date).toISOString().split('T')[0] : ''} 
                                onChange={(e) => setQuotation({ ...quotation, date: e.target.value })}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.labelGroup}>Phone</label>
                            <input className={styles.input} value={selectedCustomer?.phone ?? ''} readOnly/>
                        </div>
                    </div>
                    {quotation && quotation.customer && (
                        <div className={styles.column}>
                            <div className={styles.column}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.labelGroup}>Quotation status</label>
                                    <select 
                                        className={styles.input} 
                                        value={quotation.quotationStatus ?? 'Pending'} 
                                        onChange={(e) => setQuotation({...quotation, quotationStatus: e.target.value})}
                                    >
                                        {Object.values(QuotationStatus).map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.column}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.labelGroup}>Customer status</label>
                                    <select 
                                        className={styles.input} 
                                        value={quotation.customerStatus ?? 'Pending'} 
                                        onChange={(e) => setQuotation({...quotation, customerStatus: e.target.value})}
                                    >
                                        {Object.values(CustomerStatus).map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                        <div className={styles.fullWidthGroup}>
                            <label className={styles.labelGroup}>Customer/Organization</label>
                            <select className={styles.input} value={selectedCustomer?.id || ''} onChange={handleCustomerChange} required>
                                <option value=''>Select a customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.customerName}
                                    </option>
                                ))}
                            </select>
                            <button className={styles.button} onClick={() => setIsCustomerModalOpen(true)}>&#10011; Add new customer</button>
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
                        selectedQuotation={quotation}
                        handleEditItemDetail={handleEditItemDetail}
                        handleRemoveItemDetail={handleRemoveItemDetail}
                    />
                    <TotalSummery totalRiel={totalRielWithTax} totalAfterPayment={totalUSDWithTax}/>
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
                            <button className={styles.button} onClick={handleCreateQuotation}>Submit request for approval</button>
                            <button className={styles.buttonCancel} onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                    <div style={{height: "200px"}}></div>
                    <CustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onCustomerAdded={handleRefreshCustomer}/>
                    <ItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onItemAdded={handleRefreshNewItem}/>
                    <ItemDetailModal 
                        isOpen={isItemDetailModalOpen} 
                        onClose={() => setIsItemDetailModalOpen(false)}
                        onQuotationItemAdded={handleRefreshItemDetail}
                        selectedItem={selectedItem}
                        quotation={quotation}
                        isEditQuotationItem={isEditQuotationItem}
                        selectedQuotationItem={selectedQuotationItem}/>
            </div>
        </>
    );
}
