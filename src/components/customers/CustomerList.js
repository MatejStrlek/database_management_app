import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCustomers, deleteCustomer, fetchCities } from '../../services/customerService';
import { getAuthToken } from '../../services/authService';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const isAuthenticated = !!getAuthToken();

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const sortParam = sortField ? `${sortField},${sortOrder}` : '';
            const response = await fetchCustomers(currentPage, itemsPerPage, sortParam, searchQuery);

            const citiesResponse = await fetchCities();
            const customersWithCities = response.data.map((customer) => {
                // eslint-disable-next-line
                const city = citiesResponse.find((c) => c.id == customer.cityId);
                return { ...customer, City: city || null };
            });

            setCustomers(customersWithCities);
            setTotalItems(response.total);
        } catch (err) {
            setError('Failed to fetch customers.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, sortField, sortOrder, searchQuery]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '⇅';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await deleteCustomer(id);
                loadCustomers();
            } catch (err) {
                setError('Failed to delete customer.');
            }
        }
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const renderPageNumbers = () => {
        const maxVisiblePages = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        const pages = [];

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('...');
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages.map((page, index) => (
            <li
                key={index}
                className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
            >
                {page === '...' ? (
                    <span className="page-link">...</span>
                ) : (
                    <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                )}
            </li>
        ));
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Customer List</h2>
                {isAuthenticated && (
                    <Link to="/customers/new" className="btn btn-primary">
                        Add Customer
                    </Link>
                )}
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
                <div className="col-md-6 d-flex justify-content-end align-items-center">
                    <label className="me-2">Items per page:</label>
                    <select
                        className="form-select w-auto"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                                        ID {getSortIcon('id')}
                                    </th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                        First Name {getSortIcon('name')}
                                    </th>
                                    <th onClick={() => handleSort('surname')} style={{ cursor: 'pointer' }}>
                                        Last Name {getSortIcon('surname')}
                                    </th>
                                    <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                        Email {getSortIcon('email')}
                                    </th>
                                    <th onClick={() => handleSort('telephone')} style={{ cursor: 'pointer' }}>
                                        Phone {getSortIcon('telephone')}
                                    </th>
                                    <th>City</th>
                                    {isAuthenticated && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAuthenticated ? 6 : 5} className="text-center">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/customers/${customer.id}/bills`)}
                                        >
                                            <td>{customer.id}</td>
                                            <td>{customer.name}</td>
                                            <td>{customer.surname}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.telephone}</td>
                                            <td>{customer.City?.name || 'N/A'}</td>
                                            {isAuthenticated && (
                                                <td
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Link
                                                        to={`/customers/view/${customer.id}`}
                                                        className="btn btn-sm btn-info me-2"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        to={`/customers/edit/${customer.id}`}
                                                        className="btn btn-sm btn-warning me-2"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(customer.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                        </div>
                        <nav aria-label="Customer pagination">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                    >
                                        « First
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ‹ Previous
                                    </button>
                                </li>
                                {renderPageNumbers()}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next ›
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Last »
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                </>
            )}
        </div>
    );
};

export default CustomerList;