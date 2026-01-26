import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { getSortIcon } from '../../utils/sortHelper';
import Pagination from '../common/Pagination';
import { getColorStyle } from '../../utils/colorBadge';

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

    const totalItems = filteredProducts.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
                <div className="col-md-6 text-end">
                    {isAuthenticated && (
                        <Link to="/products/add" className="btn btn-primary">
                            Add Product
                        </Link>
                    )}
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
                                        Product Number{getSortIcon('productNumber', sortField, sortOrder)}
                                    </th>
                                    <th
                                        onClick={() => handleSort('name')}
                                        style={{ cursor: 'pointer' }}
                                        className="user-select-none"
                                    >
                                        Name{getSortIcon('name', sortField, sortOrder)}
                                    </th>
                                    <th
                                        onClick={() => handleSort('color')}
                                        style={{ cursor: 'pointer' }}
                                        className="user-select-none"
                                    >
                                        Color{getSortIcon('color', sortField, sortOrder)}
                                    </th>
                                    <th
                                        onClick={() => handleSort('price')}
                                        style={{ cursor: 'pointer' }}
                                        className="user-select-none"
                                    >
                                        Price{getSortIcon('price', sortField, sortOrder)}
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
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(totalItems / itemsPerPage)}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductsList;