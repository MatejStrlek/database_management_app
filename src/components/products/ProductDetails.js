import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAllProducts } from '../../services/productService';
import { getAllSubcategories } from '../../services/subcategoryService';
import { getAllCategories } from '../../services/categoryService';
import { getColorStyle } from '../../utils/colorBadge';

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [subcategoriesData, categoriesData, productsData] =
                    await Promise.all([
                        getAllSubcategories(),
                        getAllCategories(),
                        location.state?.product ? Promise.resolve(null) : getAllProducts()
                    ]);

                setSubcategories(subcategoriesData);
                setCategories(categoriesData);

                if (location.state?.product) {
                    setProduct(location.state.product);
                } else {
                    const foundProduct = productsData.find(
                        (p) => p.id === parseInt(id, 10)
                    );
                    if (foundProduct) {
                        setProduct(foundProduct);
                    } else {
                        setError('Product not found');
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, location.state]);

    const getSubcategory = () => {
        if (!product) return null;
        return subcategories.find((sub) => sub.id === product.subCategoryId) || null;
    };

    const getSubcategoryName = () => {
        const sub = getSubcategory();
        return sub ? sub.name : 'N/A';
    };

    const getCategoryName = () => {
        const sub = getSubcategory();
        if (!sub) return 'N/A';
        const cat = categories.find((c) => c.id === sub.categoryId);
        return cat ? cat.name : 'N/A';
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

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    Product not found
                </div>
                <button
                    className="btn btn-secondary mt-3"
                    onClick={() => navigate('/products')}
                >
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h2 className="mb-0">Product Details</h2>
                            <h3 className="badge bg-light text-dark">
                                {product.productNumber}
                            </h3>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold">Name:</span>
                                    <span className="text-end">{product.name}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold">Color:</span>
                                    <span>
                                        {product.color ? (
                                            <span
                                                style={{
                                                    ...getColorStyle(product.color),
                                                    padding: '0.35em 0.65em',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    borderRadius: '0.375rem',
                                                    display: 'inline-block',
                                                    minWidth: '60px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {product.color}
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold">Subcategory:</span>
                                    <span className="badge bg-primary">
                                        {getSubcategoryName()}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold">Category:</span>
                                    <span className="badge bg-secondary">
                                        {getCategoryName()}
                                    </span>
                                </li>
                                <li className="list-group-item bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold fs-5">
                                            Unit Price:
                                        </span>
                                        <span className="fs-4 fw-bold text-success">
                                            ${Number(product.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="card-footer bg-white">
                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/products')}
                                >
                                    Back to List
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate(`/products/edit/${id}`, {
                                            state: { product }
                                        })
                                    }
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;