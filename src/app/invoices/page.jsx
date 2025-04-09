'use client'
import styles from './page.module.css';
import { Container } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { invoiceCreatePost, invoiceDelete, invoiceGet, invoiceGetAll, invoiceGetAllCustom, invoiceGetAllDefault, invoiceUpdate } from '@/actions/actions';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import * as XLSX from 'xlsx';
import InvoiceFilter from './invoiceFilter';
import InvoiceTable from './invoiceTable';

export default function Invoice() {
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [invoiceStatus, setInvoiceStatus] = useState('Default');

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const router = useRouter();

    const pageSize = 10;
    const totalPages = Math.ceil(invoices.length / pageSize);
    const currentInvoice = invoices.slice(
        (currentPage - 1) * pageSize, 
        currentPage * pageSize
    );

    const fetchInvoice = async () => {
        try {
            const allInvoices = await invoiceGetAllDefault();
            const updatedInvoices = updateOverdueInvoices(allInvoices);
            setInvoices(updatedInvoices);
        } catch (error) {
            alert("Error fetching invoice: " + error.message);
        }
    };
    const fetchCustomInvoice = async () => {
        try {
            const filteredInvoices = await invoiceGetAllCustom(invoiceStatus);
            setInvoices(filteredInvoices);
        } catch (error) {
            alert("Error fetching custom invoices: " + error.message);
        }
    };
    const fetchAllInvoice = async () => {
        try {
            const allInvoices = await invoiceGetAll();
            setInvoices(allInvoices);
        } catch (error) {
            alert("Error fetching all invoices: " + error.message);
        }
    };
    useEffect(() => {
        fetchInvoice();
    }, []);
    useEffect(() => {
        handleFilter();
    }, [invoiceStatus]);
    const handleCreateInvoice = async () => {
        try{
            const invoiceData = {
                date: new Date().toISOString(),
                amount: 0,
                amountPaid: 0,
                amountDue: 0,
                invoiceStatus: 'Pending',
                customerId: null,
                quotationId: null
            };
            const newInvoice = await invoiceCreatePost(invoiceData);
            const updated = await invoiceGet(newInvoice.id);
            router.push(`/invoices/${updated.id}/create`);
        } catch (error) {
            alert("Error fetching invoice: " + error.message);
        }
    };
    const handleViewInvoice = async (id) => {
        try{
            router.push(`/invoices/${id}/view`);
        } catch (error) {
            alert("Error viewing invoice: " + error.message);
        }
    };
    const handleDeleteInvoice = async () => {
        try {
            if (selectedInvoice) {
                await invoiceDelete(selectedInvoice);
                fetchInvoice();
            }
        } catch (error) {
            alert("Error deleting quotation: " + error.message);
        } finally {
            setShowDeleteModal(false);
            setSelectedInvoice(null);
        }
    };
    const handleEditInvoice = async (id) => {
        try{
            router.push(`/invoices/${id}/create`);
        } catch (error) {
            alert("Error editing invoices: " + error.message);
        }
    };
    const handlePrintInvoice = async (invoice) => {
        try {
            if (!invoice) throw new Error("No invoice selected.");

            const format = (num) => Number(num).toFixed(2);

            const invoiceDetails = [
                ["Invoice ID", invoice.id],
                ["Date", invoice.date],
                ["Due Date", invoice.dueDate],
                ["Customer ID", invoice.customer?.id ?? "Unknown"],
                ["Customer Name", invoice.customer?.customerName ?? "Unknown"],
                ["Customer Address", invoice.customer?.address ?? "Unknown"],
                ["Customer Phone", invoice.customer?.phone ?? "Unknown"],
                ["Amount", `${format(invoice.amount)} USD`],
                ["Amount Paid", `${format(invoice.amountPaid)} USD`],
                ["Amount Due", `${format(invoice.amountDue)} USD`],
                ["Invoice Status", invoice.quotationStatus]
            ];

            const itemSheetData = invoice.quotation?.QuotationItems?.map((item, i) => ({
                "No.": i + 1,
                "Item Name": item.item?.itemName ?? "N/A",
                "Description": item.item?.description ?? "",
                "Remark": item.remark ?? "",
                "Quantity": item.quantity,
                "Unit": item.unit ?? "Unit",
                "Unit Price ($)": format(item.price),
                "Sub-Total ($)": format(item.quantity * item.price),
            })) ?? [];            

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(invoiceDetails), "Invoice Details");
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(itemSheetData), "Items Details");

            const filename = `invoice_${invoice.id}_${new Date().toISOString().split("T")[0]}.xlsx`;
            XLSX.writeFile(workbook, filename);
            
        } catch (error) {
            alert("Error exporting invoice: " + error.message);
        }
    };
    const handleFilter = async () => {
        try {
            if(invoiceStatus === "Default"){
                fetchInvoice();
                return;
            }
            else if(invoiceStatus === "All"){
                fetchAllInvoice();
                return;
            }
            else {
                fetchCustomInvoice();
                return;
            }
        } catch (error) {
            alert("Error filtering quotations: " + error.message);
        }
    };
    const updateOverdueInvoices = (invoices) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        return invoices.map(invoice => {
            const dueDate = new Date(invoice.dueDate);
            if (dueDate < today && invoice.invoiceStatus !== "Paid") {
                const Data = {
                    date: new Date(invoice.date),
                    dueDate: new Date(invoice.dueDate),
                    invoiceStatus: invoice.invoiceStatus,
                    customerId: invoice.customer?.id || null,
                    quotationId: invoice.quotation?.id || null
                }
                invoiceUpdate(invoice.id, Data);
            }
            return invoice;
        });
    };
    const confirmDeleteInvoice = (id) => {
        setSelectedInvoice(id);
        setShowDeleteModal(true);
    };
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    return (
        <>
            <Container className="d-flex align-items-center justify-content-center py-5">
                <div className={styles.container}>
                    <h2>Invoice list(Staff)</h2>
                    <p>Invoice are reviewed by Senior and Division head before sending to customer to get payment for a project.</p>
                    <InvoiceFilter
                        invoiceStatus={invoiceStatus}
                        setInvoiceStatus={setInvoiceStatus}
                        onCreateInvoice={handleCreateInvoice}
                    />
                    <InvoiceTable 
                        currentInvoice={currentInvoice}
                        handleViewInvoice={handleViewInvoice}
                        handlePrintInvoice={handlePrintInvoice}
                        handleEditInvoice={handleEditInvoice}
                        confirmDeleteInvoice={confirmDeleteInvoice}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
                <ConfirmationModal 
                    show={showDeleteModal} 
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteInvoice}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this?"
                />
            </Container>
        </>
    );
}
