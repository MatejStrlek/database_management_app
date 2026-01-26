import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, deleteProduct } from '../services/productService';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData] = await Promise.all([
                getAllProducts()
            ]);

            setProducts(productsData);
            setFilteredProducts(productsData);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = products.filter(product => {
            return (
                product.name?.toLowerCase().includes(value) ||
                product.productNumber?.toLowerCase().includes(value) ||
                product.color?.toLowerCase().includes(value)
            );
        });
        setFilteredProducts(filtered);
    };

    const handleSort = (field) => {
        let order = 'asc';
        if (sortField === field && sortOrder === 'asc') {
            order = 'desc';
        }
        setSortField(field);
        setSortOrder(order);

        const sorted = [...filteredProducts].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredProducts(sorted);
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return ' ⇅';
        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(productId);
                fetchData();
            } catch (err) {
                alert('Failed to delete product: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const getColorStyle = (color) => {
        if (!color) return { backgroundColor: '#6c757d', color: '#fff' };

        const colorMap = {
            'red': { backgroundColor: '#dc3545', color: '#fff' },
            'blue': { backgroundColor: '#0d6efd', color: '#fff' },
            'sky blue': { backgroundColor: '#0dcaf0', color: '#212529' },
            'green': { backgroundColor: '#198754', color: '#fff' },
            'mint green': { backgroundColor: '#20c997', color: '#212529' },
            'yellow': { backgroundColor: '#ffc107', color: '#212529' },
            'orange': { backgroundColor: '#fd7e14', color: '#fff' },
            'purple': { backgroundColor: '#6f42c1', color: '#fff' },
            'pink': { backgroundColor: '#d63384', color: '#fff' },
            'black': { backgroundColor: '#212529', color: '#fff' },
            'white': { backgroundColor: '#f8f9fa', color: '#212529', border: '1px solid #adb5bd' },
            'gray': { backgroundColor: '#6c757d', color: '#fff' },
            'grey': { backgroundColor: '#6c757d', color: '#fff' },
            'brown': { backgroundColor: '#8b4513', color: '#fff' },
            'cyan': { backgroundColor: '#0dcaf0', color: '#212529' },
            'teal': { backgroundColor: '#20c997', color: '#212529' },
            'silver': { backgroundColor: '#c0c0c0', color: '#212529' },
            'gold': { backgroundColor: '#ffd700', color: '#212529' },
            'maroon': { backgroundColor: '#800000', color: '#fff' },
            'olive': { backgroundColor: '#808000', color: '#fff' },
            'lime': { backgroundColor: '#32cd32', color: '#212529' },
            'aqua': { backgroundColor: '#00ffff', color: '#212529' },
            'navy': { backgroundColor: '#000080', color: '#fff' },
            'fuchsia': { backgroundColor: '#ff00ff', color: '#fff' },
            'orchid': { backgroundColor: '#da70d6', color: '#212529' },
            'tan': { backgroundColor: '#d2b48c', color: '#212529' },
            'indigo': { backgroundColor: '#4b0082', color: '#fff' },
            'ivory': { backgroundColor: '#fffff0', color: '#212529', border: '1px solid #adb5bd' }
        };

        const lowerColor = color.toLowerCase();

        if (colorMap[lowerColor]) {
            return colorMap[lowerColor];
        }

        return { backgroundColor: color, color: '#212529', border: '1px solid #dee2e6' };
    };

    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => setCurrentPage(i)}
                    >
                        {i}
                    </button>
                </li>
            );
        }

        return pageNumbers;
    };

    if (!isAuthenticated) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    Please log in to view products.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Products Management</h2>
                {isAuthenticated && (
                    <Link to="/products/add" className="btn btn-primary">
                        Add Product
                    </Link>
                )}
            </div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="col-md-6 d-flex justify-content-end align-items-center">
                    <label className="me-2">Items per page:</label>
                    <select
                        className="form-select w-auto"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
            {filteredProducts.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    No products found. Click "Add Product" to create product.
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th
                                        onClick={() => handleSort('productNumber')}
                                        style={{ cursor: 'pointer' }}
                                        className="user-select-none"
                                    >
                                        Product Number{getSortIcon('productNumber')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('name')}
                                        style={{ cursor: 'pointer' }}
                                        className="user-select-none"
                                    >
                                        Name{getSortIcon('name')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('color')}
                                        style={{ cursor: 'pointer' }}
                                        className="user-select-none"
                                    >
                                        Color{getSortIcon('color')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('price')}
                                        style={{ cursor: 'pointer' }}
                                        className="user-select-none"
                                    >
                                        Price{getSortIcon('price')}
                                    </th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <span className="badge bg-secondary">{product.productNumber}</span>
                                        </td>
                                        <td className="fw-semibold">{product.name}</td>
                                        <td>
                                            {product.color ? (
                                                <span
                                                    style={{
                                                        ...getColorStyle(product.color),
                                                        padding: '0.35em 0.65em',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        borderRadius: '0.375rem',
                                                        display: 'inline-block',
                                                        textAlign: 'center',
                                                        minWidth: '60px'
                                                    }}
                                                >
                                                    {product.color}
                                                </span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge bg-primary">
                                                ${Number(product.price || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                            <Link
                                                to={`/products/${product.id}`}
                                                state={{ product }}
                                                className="btn btn-sm btn-info me-2"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/products/edit/${product.id}`}
                                                state={{ product }}
                                                className="btn btn-sm btn-warning me-2"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                        </div>
                        <nav aria-label="Product pagination">
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

export default ProductsList;