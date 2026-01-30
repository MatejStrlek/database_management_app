import { useState } from 'react';
import PropTypes from 'prop-types';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
    itemsPerPageOptions = [10, 20, 50]
}) => {
    const [localItemsPerPage, setLocalItemsPerPage] = useState(itemsPerPage);

    const handleItemsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setLocalItemsPerPage(value);
        onItemsPerPageChange(value);
        onPageChange(1);
    };

    const renderPageNumbers = () => {
        const maxVisiblePages = 5;
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) pages.push(1);
        if (startPage > 2) pages.push('...');
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages.map((page, index) => (
            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                {page === '...' ? (
                    <span className="page-link">...</span>
                ) : (
                    <button
                        className="page-link"
                        onClick={() => onPageChange(page)}
                        disabled={!page}
                    >
                        {page}
                    </button>
                )}
            </li>
        ));
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted me-3">
                Showing {startItem} to {endItem} of {totalItems} entries
            </div>
            <div className="me-auto">
                <label className="me-2 small">Items per page:</label>
                <select
                    className="form-select form-select-sm w-auto d-inline-block"
                    value={localItemsPerPage}
                    onChange={handleItemsChange}
                    style={{ minWidth: '80px' }}
                >
                    {itemsPerPageOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
            <nav aria-label="Pagination" className="mb-0 flex-grow-1">
                <ul className="pagination pagination-sm mb-0 justify-content-center mx-3">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                            « First
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                            ‹ Prev
                        </button>
                    </li>
                    {renderPageNumbers()}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            Next ›
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
                            Last »
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    onItemsPerPageChange: PropTypes.func.isRequired,
    totalItems: PropTypes.number.isRequired,
    itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
};

Pagination.defaultProps = {
    itemsPerPageOptions: [10, 20, 50],
};

export default Pagination;