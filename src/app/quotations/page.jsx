'use client'
import styles from './page.module.css';
import { Container} from 'react-bootstrap';
import { useState, React, useEffect } from 'react';
import { quotationCreatePost, quotationGet, quotationDelete, quotationGetAllDefault, quotationGetAllCustom, quotationGetAll } from '@/actions/actions';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../components/ConfirmationModal';
import Pagination from '../components/Pagination';
import QuotationTable from './quotationTable';
import * as XLSX from 'xlsx';
import QuotationFilters from './quotationFilter';

export default function Quotation() {
    const [quotations, setQuotations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [quotationStatus, setQuotationStatus] = useState('Default');
    const [customerStatus, setCustomerStatus] = useState('Default');
    const router = useRouter();
    const pageSize = 10;
    const totalPages = Math.ceil(quotations.length / pageSize);
    const currentQuotations = quotations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const fetchQuotations = async () => {
        try {
            const allQuotations = await quotationGetAllDefault();
            setQuotations(allQuotations);
        } catch (error) {
            alert("Error fetching quotations: " + error.message);
        }
    };
    const fetchCustomQuotations = async () => {
        try {
            const filteredQuotations = await quotationGetAllCustom(quotationStatus, customerStatus);
            setQuotations(filteredQuotations);
        } catch (error) {
            alert("Error fetching custom quotations: " + error.message);
        }
    };
    const fetchAllQuotations = async () => {
        try {
            const allQuotations = await quotationGetAll();
            setQuotations(allQuotations);
        } catch (error) {
            alert("Error fetching all quotations: " + error.message);
        }
    };
    useEffect(() => {
        fetchQuotations();
    }, []);
    useEffect(() => {
        handleFilter();
    }, [quotationStatus, customerStatus]);
    const handleCreateQuotation = async () => {
        try{
            const quotationData = {
                date: new Date().toISOString(),
                quotationStatus: "Pending",
                customerStatus: "Pending",
                customerId: null,
                invoiceId: null,
            };
            const newQuote = await quotationCreatePost(quotationData);
            const updated = await quotationGet(newQuote.id);
            router.push(`/quotations/${updated.id}/create`);
        } catch (error) {
            alert("Error creating quotation: " + error.message);
        }
    };
    const handleDeleteQuotation = async () => {
        try {
            if (selectedQuotation) {
                await quotationDelete(selectedQuotation);
                fetchQuotations();
            }
        } catch (error) {
            alert("Error deleting quotation: " + error.message);
        } finally {
            setShowDeleteModal(false);
            setSelectedQuotation(null);
        }
    };
    const handleViewQuotation = async (id) => {
        try{
            router.push(`/quotations/${id}/view`);
        } catch (error) {
            alert("Error viewing quotation: " + error.message);
        }
    };
    const handlePrintQuotation = async (quotation) => {
        try {
            if (!quotation) return alert("No quotation selected.");

            const items = quotation.QuotationItems || [];
            const customer = quotation.customer || {};
            const totalUSD = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
            const taxMultiplier = 1.05;
            const rielRate = 4000;

            const format = (num) => num.toFixed(2);
    
            const quotationDetails = [
                ["Quotation ID", quotation.id],
                ["Date", quotation.date],
                ["Customer ID", customer.id ?? "Unknown"],
                ["Customer Name", customer.customerName ?? "Unknown"],
                ["Customer Address", customer.address ?? "Unknown"],
                ["Customer Phone", customer.phone ?? "Unknown"],
                ["Quotation Status", quotation.quotationStatus],
                ["Customer Status", quotation.customerStatus],
                ["Grand Total (USD)", format(totalUSD * taxMultiplier)],
                ["Grand Total (Riel)", format(totalUSD * rielRate * taxMultiplier)],
            ];
    
            const itemSheetData = items.map((item, i) => ({
                "No.": i + 1,
                "Item Name": item.item?.itemName ?? "N/A",
                "Description": item.item?.description ?? "",
                "Remark": item.remark ?? "",
                "Quantity": item.quantity,
                "Unit": item.unit ?? "Unit",
                "Unit Price ($)": item.price,
                "Sub-Total ($)": format(item.quantity * item.price),
            }));
    
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(quotationDetails), "Quotation Details");
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(itemSheetData), "Quotation Items");
    
            const filename = `quotation_${quotation.id}_${new Date().toISOString().split("T")[0]}.xlsx`;
            XLSX.writeFile(workbook, filename);
            
        } catch (error) {
            alert("Error exporting quotation: " + error.message);
        }
    };
    const handleEditQuotation = async (id) => {
        try{
            router.push(`/quotations/${id}/create`);
        } catch (error) {
            alert("Error editing quotation: " + error.message);
        }
    };
    const handleFilter = async () => {
        try {
            if(quotationStatus === "Default" || customerStatus === "Default"){
                fetchQuotations();
                return;
            }
            else if(quotationStatus === "All" || customerStatus === "All"){
                fetchAllQuotations();
                return;
            }
            else {
                fetchCustomQuotations();
                return;
            }
        } catch (error) {
            alert("Error filtering quotations: " + error.message);
        }
    };
    const confirmDeleteQuotation = (id) => {
        setSelectedQuotation(id);
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
                    <h2>Quotation list(Staff)</h2>
                    <p>Quotations are proposed to customer to bid for a project.</p>
                    <QuotationFilters 
                        quotationStatus={quotationStatus}
                        setQuotationStatus={setQuotationStatus}
                        customerStatus={customerStatus}
                        setCustomerStatus={setCustomerStatus}
                        onCreateQuotation={handleCreateQuotation}
                    />
                    <QuotationTable 
                        quotations={currentQuotations}
                        onView={handleViewQuotation}
                        onPrint={handlePrintQuotation}
                        onEdit={handleEditQuotation}
                        onDelete={confirmDeleteQuotation}
                    />
                    <div className="d-flex gap-3 justify-content-end">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
                <ConfirmationModal 
                    show={showDeleteModal} 
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteQuotation}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this?"
                />
            </Container>
        </>
    );
}
