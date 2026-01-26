import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAllProducts, createProduct, updateProduct } from '../../services/productService';
import { getAllSubcategories } from '../../services/subcategoryService';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        productNumber: '',
        color: '',
        subCategoryId: '',
        price: 0
    });
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const subcats = await getAllSubcategories();
                setSubcategories(subcats);
            } catch (err) {
                setError('Failed to load subcategories');
            }
        };
        fetchSubcategories();
    }, []);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            if (location.state?.product) {
                const product = location.state.product;
                setFormData({
                    name: product.name || '',
                    productNumber: product.productNumber || '',
                    color: product.color || '',
                    subCategoryId: product.subCategoryId || '',
                    price: product.price || 0
                });
            } else {
                const products = await getAllProducts();
                const product = products.find(p => p.id === parseInt(id));
                if (product) {
                    setFormData({
                        name: product.name || '',
                        productNumber: product.productNumber || '',
                        color: product.color || '',
                        subCategoryId: product.subCategoryId || '',
                        price: product.price || 0
                    });
                } else {
                    setError('Product not found');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [id, location.state?.product]);

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            fetchProduct();
        }
    }, [id, fetchProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['price', 'subCategoryId'].includes(name)
                ? parseInt(value) || ''
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.productNumber) {
            setError('Please fill in all required fields');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                productNumber: formData.productNumber,
                color: formData.color || null,
                subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
                price: formData.price
            };
            if (isEditMode) {
                await updateProduct(id, payload);
            } else {
                await createProduct(payload);
            }
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h2 className="mb-0">
                                {isEditMode ? 'Edit Product' : 'Add Product'}
                            </h2>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    {error}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setError(null)}
                                        aria-label="Close"
                                    ></button>
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="productNumber" className="form-label">
                                        Product Number <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="productNumber"
                                        name="productNumber"
                                        value={formData.productNumber}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                        placeholder="e.g., PROD-001"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">
                                        Product Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                        placeholder="Enter product name"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="color" className="form-label">Color</label>
                                    <input
                                        type="text"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="e.g., Red, Blue (optional)"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="subCategoryId" className="form-label">Subcategory</label>
                                    <select
                                        id="subCategoryId"
                                        name="subCategoryId"
                                        value={formData.subCategoryId}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="">Select a subcategory (optional)</option>
                                        {subcategories.map((subcat) => (
                                            <option key={subcat.id} value={subcat.id}>
                                                {subcat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="price" className="form-label">Unit Price</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="form-control"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/products')}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                {isEditMode ? 'Update' : 'Create'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;