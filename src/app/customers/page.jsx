'use client'
import { Container } from "react-bootstrap";
import styles from '../invoices/page.module.css';
import Pagination from "../components/Pagination";
import ConfirmationModal from "../components/ConfirmationModal";
import { useEffect, useState } from "react";
import { customerDelete, customerGetAllById } from "@/actions/actions";
import CustomerModal from "../components/CustomerModal";


export default function Customer() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isEditCustomer, setIsEditCustomer] = useState(false);

    const pageSize = 10;
    const totalPages = Math.ceil(customers.length / pageSize);
    const currentCustomers = customers.slice(
        (currentPage - 1) * pageSize, 
        currentPage * pageSize
    );    
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    const fetchCustomer = async () => {
        try {
            const allCustomers = await customerGetAllById();
            setCustomers(allCustomers);
        } catch (error) {
            alert("Error fetching customers: " + error.message);
        }
    };
    useEffect(() => {
        fetchCustomer();
    }, [])
    const handleAddCustomer = async () => {
        setIsCustomerModalOpen(true);
        setIsEditCustomer(false);
        setSelectedCustomer(null);
    };
    const handleEditCustomer = async (Customer) => {
        setSelectedCustomer(Customer);
        setIsCustomerModalOpen(true);
        setIsEditCustomer(true);
    };
    const handleDeleteCustomer = async () => {
        try {
            if (selectedCustomer) {
                await customerDelete(selectedCustomer.id);
                fetchCustomer();
            }
        } catch (error) {
            alert("Error deleting Customer: " + error.message);
        } finally {
            setShowDeleteModal(false);
            setSelectedCustomer(null);
        }
    };
    const confirmDeleteCustomer = (id) => {
        setSelectedCustomer(id);
        setShowDeleteModal(true);
    };
    return (
        <>
            <Container className="d-flex align-Customers-center justify-content-center py-5">
                <div className={styles.container}>
                    <h2>Customer list</h2>
                    <div className={styles.row}>
                        <button className={styles.button} onClick={handleAddCustomer}>Create Customer</button>
                    </div>
                    <table className="w-100 table table-bordered table-hover mt-3">
                        <thead>
                            <tr>
                            <th style={{width: '15%'}}>Action</th>
                            <th style={{width: '10%'}}>NO.</th>
                            <th style={{width: '20%'}}>Customer name</th>
                            <th style={{width: '40%'}}>Address</th>
                            <th style={{width: '15%'}}>Phone number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(currentCustomers) && currentCustomers.length > 0 ? (
                                currentCustomers.map((i) => {
                                    return (
                                        <tr key={i.id}>
                                            <td className="d-flex gap-3">
                                                <button className={styles.buttonEdit} onClick={() => handleEditCustomer(i)}>Edit</button>
                                                <button className={styles.buttonDelete} onClick={() => confirmDeleteCustomer(i)}>Delete</button>
                                            </td>
                                            <td>{i.id}</td>
                                            <td>{i.customerName}</td>
                                            <td>{i.address}</td>
                                            <td>{i.phone}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7">No Customers available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="d-flex gap-3 justify-content-end">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                    </div>
                </div>
                <CustomerModal 
                    isOpen={isCustomerModalOpen} 
                    onClose={() => setIsCustomerModalOpen(false)} 
                    onCustomerAdded={fetchCustomer}
                    isEditCustomer={isEditCustomer}
                    selectedCustomer={selectedCustomer}/>
                <ConfirmationModal 
                    show={showDeleteModal} 
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteCustomer}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this?"
                />
            </Container>
        </>
    )
}