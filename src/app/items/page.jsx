'use client'
import { Container } from "react-bootstrap";
import styles from '../invoices/page.module.css';
import Pagination from "../components/Pagination";
import ConfirmationModal from "../components/ConfirmationModal";
import { useEffect, useState } from "react";
import { itemDelete, itemGetAll } from "@/actions/actions";
import ItemModal from "../components/ItemModal";


export default function Item() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isEditItem, setIsEditItem] = useState(false);

    const pageSize = 10;
    const totalPages = Math.ceil(items.length / pageSize);
    const currentItems = items.slice(
        (currentPage - 1) * pageSize, 
        currentPage * pageSize
    );    
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    const fetchItem = async () => {
        try {
            const allItems = await itemGetAll();
            setItems(allItems);
        } catch (error) {
            alert("Error fetching items: " + error.message);
        }
    };
    useEffect(() => {
        fetchItem();
    }, [])
    const handleAddItem = async () => {
        setIsItemModalOpen(true);
        setIsEditItem(false);
        setSelectedItem(null);
    };
    const handleEditItem = async (item) => {
        setSelectedItem(item);
        setIsItemModalOpen(true);
        setIsEditItem(true);
    };
    const handleDeleteItem = async () => {
        try {
            if (selectedItem) {
                await itemDelete(selectedItem.id);
                fetchItem();
            }
        } catch (error) {
            alert("Error deleting item: " + error.message);
        } finally {
            setShowDeleteModal(false);
            setSelectedItem(null);
        }
    };
    const confirmDeleteItem = (id) => {
        setSelectedItem(id);
        setShowDeleteModal(true);
    };
    return (
        <>
            <Container className="d-flex align-items-center justify-content-center py-5">
                <div className={styles.container}>
                    <h2>Item list</h2>
                    <div className={styles.row}>
                        <button className={styles.button} onClick={handleAddItem}>Create item</button>
                    </div>
                    <table className="w-100 table table-bordered table-hover mt-3">
                        <thead>
                            <tr>
                            <th style={{width: '15%'}}>Action</th>
                            <th style={{width: '10%'}}>NO.</th>
                            <th style={{width: '25%'}}>Items</th>
                            <th style={{width: '40%'}}>Description</th>
                            <th style={{width: '10%'}}>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(currentItems) && currentItems.length > 0 ? (
                                currentItems.map((i) => {
                                    return (
                                        <tr key={i.id}>
                                            <td className="d-flex gap-3">
                                                <button className={styles.buttonEdit} onClick={() => handleEditItem(i)}>Edit</button>
                                                <button className={styles.buttonDelete} onClick={() => confirmDeleteItem(i)}>Delete</button>
                                            </td>
                                            <td>{i.id}</td>
                                            <td>{i.itemName}</td>
                                            <td>{i.description}</td>
                                            <td>{i.Unit}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7">No items available.</td>
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
                <ItemModal 
                    isOpen={isItemModalOpen} 
                    onClose={() => setIsItemModalOpen(false)} 
                    onItemAdded={fetchItem}
                    isEditItem={isEditItem}
                    selectedItem={selectedItem}/>
                <ConfirmationModal 
                    show={showDeleteModal} 
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteItem}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this?"
                />
            </Container>
        </>
    )
}