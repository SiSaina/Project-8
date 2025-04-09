import React from "react";
import styles from "./Pagination.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const visiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="d-flex gap-3 justify-content-end">
            <button
                className="btn btn-secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            <div className="d-flex gap-2">
                {startPage > 1 && (
                    <>
                        <button className={styles.buttonPage} onClick={() => onPageChange(1)}>1</button>
                        {startPage > 2 && <span>...</span>}
                    </>
                )}

                {pages.map((page) => (
                    <button
                        key={page}
                        className={`${styles.buttonPage} ${currentPage === page ? styles.activePage : ""}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span>...</span>}
                        <button className={styles.buttonPage} onClick={() => onPageChange(totalPages)}>
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            <button
                className="btn btn-secondary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
