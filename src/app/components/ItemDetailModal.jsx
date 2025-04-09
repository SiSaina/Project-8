'use client';
import React, { useEffect, useState } from 'react';
import styles from "./Style.module.css";
import { quotationItemCreatePost, quotationItemUpdatePost } from '@/actions/actions';

const quotationItemModal = ({ isOpen, onClose, onQuotationItemAdded, quotation, selectedItem, isEditQuotationItem, selectedQuotationItem }) => {
    const [quotationItem, setQuotationItem] = useState({
        remark: "",
        quantity: "",
        price: "",
        quotationId: quotation?.id || "",
        itemId: selectedItem?.id || "",
      });
      useEffect(() => {
        if(isEditQuotationItem && selectedQuotationItem) {
          setQuotationItem({...quotationItem,
            remark: selectedQuotationItem.remark || "",
            quantity: selectedQuotationItem.quantity || "",
            price: selectedQuotationItem.price || "",
            quotationId: quotation?.id || "",
            itemId: selectedItem?.id || "",});
        } else {
          setQuotationItem({...quotationItem, quotationId: quotation?.id || "", itemId: selectedItem?.id || "",});
        }
      }, [quotation, selectedItem, isEditQuotationItem, selectedQuotationItem]);

      const handleChange = (e) => {
        setQuotationItem({ ...quotationItem, [e.target.name]: e.target.value });
      };
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quotationItem.price) {
          alert("Please fill in all fields!");
          return;
        }

        try {
          const quotationItemData = {
            remark: quotationItem.remark,
            quantity: parseInt(quotationItem.quantity, 10),
            price: quotationItem.price,
            quotationId: quotationItem.quotationId,
            itemId: quotationItem.itemId,
          };
          if(isEditQuotationItem) {
            await quotationItemUpdatePost(selectedQuotationItem.id, quotationItemData);
          } else {
            await quotationItemCreatePost(quotationItemData);
          }
          onQuotationItemAdded(quotationItemData);
          setQuotationItem({ remark: "", quantity: "", price: "", quotationId: "", itemId: "" });
          onClose();
        } catch (error) {
          alert("Error adding quotation item: " + error.message);
        }
    };
    
    if (!isOpen) return null;
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2>Add Item to quotation</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="remark"
              placeholder="remark"
              value={quotationItem.remark}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="number"
              name="quantity"
              placeholder="quantity"
              value={quotationItem.quantity}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="decimal"
              name="price"
              placeholder="price"
              value={quotationItem.price}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button}>Save</button>
              <button type="button" className={styles.button} onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default quotationItemModal;
