'use client';
import React, { useEffect, useState } from 'react';
import styles from "./Style.module.css";
import { customerCreatePost, customerUpdate } from '@/actions/actions';

const CustomerModal = ({ isOpen, onClose, onCustomerAdded, isEditCustomer, selectedCustomer }) => {
    const [customer, setCustomer] = useState({
        name: "",
        address: "",
        phone: "",
      });
      
      useEffect(() => {
        if(isEditCustomer && selectedCustomer) {
          setCustomer({...customer,
            name: selectedCustomer.customerName || "",
            address: selectedCustomer.address || "",
            phone: selectedCustomer.phone || ""});
        } else {
          setCustomer({...customer, name: "", address: "", phone: ""});
        }
      }, [isEditCustomer, selectedCustomer]);

      const handleChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customer.name || !customer.address || !customer.phone) {
            alert("Please fill in all fields!");
            return;
        }
    
        try {
          const customerData = {
            name: customer.name.toLowerCase(),
            address: customer.address,
            phone: customer.phone,
          };
          if(isEditCustomer) {
            await customerUpdate(selectedCustomer.id, customerData);
          } else {
            await customerCreatePost(customerData);
          }
          onCustomerAdded(customerData);
          setCustomer({ name: "", address: "", phone: "" });
          onClose();
        } catch (error) {
            alert("Error adding customer: " + error.message);
        }
    };
    
    if (!isOpen) return null;
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2>Add New Customer</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Customer Name"
              value={customer.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="address"
              name="address"
              placeholder="Address"
              value={customer.address}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={customer.phone}
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

export default CustomerModal;
