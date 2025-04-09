'use client';
import React, { useEffect, useState } from 'react';
import styles from "./Style.module.css";
import { itemCreatePost, itemUpdate } from '@/actions/actions';

const ItemModal = ({ isOpen, onClose, onItemAdded, isEditItem, selectedItem }) => {
    const [item, setItem] = useState({
        name: "",
        description: "",
        unit: "",
      });
      
      useEffect(() => {
        if(isEditItem && selectedItem) {
          setItem({...item,
            name: selectedItem.itemName || "",
            description: selectedItem.description || "",
            unit: selectedItem.Unit || ""});
        } else {
          setItem({...item, name: "", description: "", unit: ""});
        }
      }, [isEditItem, selectedItem]);

      const handleChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!item.name) {
          alert("Please fill in all fields!");
          return;
        }
    
        try {
          const itemData = {
            name: item.name,
            description: item.description,
            unit: item.unit,
          };
          if(isEditItem) {
            await itemUpdate(selectedItem.id, itemData);
          } else {
            await itemCreatePost(itemData);
          }
          onItemAdded(itemData);
          setItem({ name: "", description: "", unit: "" });
          onClose();
        } catch (error) {
          alert("Error adding item: " + error.message);
        }
    };
    
    if (!isOpen) return null;
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2>Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Item Name"
              value={item.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="text"
              name="description"
              placeholder="description"
              value={item.description}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="text"
              name="unit"
              placeholder="unit"
              value={item.unit}
              onChange={handleChange}
              className={styles.input}
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

export default ItemModal;
