import React, { useState, useEffect, useCallback } from 'react';
import { getBillItemsByBillId, createBillItem, deleteBillItem } from '../services/billItemService';
import { getAllProducts } from '../services/productService';

const BillItemsSection = ({ billId, onTotalChange }) => {
    const [billItems, setBillItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [newItem, setNewItem] = useState({ productId: '', quantity: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(false);

    const loadProducts = useCallback(async () => {
        try {
            const allProducts = await getAllProducts();
            setProducts(allProducts);
        } catch (err) {
            setError('Failed to load products.');
        }
    }, []);

    const loadBillItems = useCallback(async () => {
        try {
            const items = await getBillItemsByBillId(billId);
            setBillItems(items);
        } catch (err) {
            console.error('Failed to load bill items:', err);
            setError('Failed to load bill items.');
        }
    }, [billId]);

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            await Promise.all([loadProducts(), loadBillItems()]);
            setLoading(false);
        };

        if (billId) {
            initialize();
        }
    }, [billId, loadProducts, loadBillItems]);

    useEffect(() => {
        const total = billItems.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
        
        if (onTotalChange) {
            onTotalChange(parseFloat(total.toFixed(2)));
        }
    }, [billItems, products, onTotalChange]);

    const handleAddItem = async () => {
        if (!newItem.productId) {
            setError('Please select a product');
            return;
        }

        if (newItem.quantity < 1) {
            setError('Quantity must be at least 1');
            return;
        }

        const billItem = {
            billId: parseInt(billId),
            productId: parseInt(newItem.productId),
            quantity: parseInt(newItem.quantity),
        };

        setAdding(true);
        try {
            const created = await createBillItem(billItem);
            setBillItems([...billItems, created]);
            setNewItem({ productId: '', quantity: 1 });
            setError(null);
        } catch (err) {
            setError('Failed to add item. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this item?')) {
            return;
        }

        try {
            await deleteBillItem(itemId);
            setBillItems(billItems.filter(item => item.id !== itemId));
            setError(null);
        } catch (err) {
            setError('Failed to remove item. Please try again.');
        }
    };

    const getProductDetails = (productId) => {
        return products.find(p => p.id === productId);
    };

    const getItemSubtotal = (item) => {
        const product = getProductDetails(item.productId);
        return product ? (product.price * item.quantity).toFixed(2) : '0.00';
    };

    const getTotalAmount = () => {
        return billItems.reduce((sum, item) => {
            const product = getProductDetails(item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0).toFixed(2);
    };

    if (loading) {
        return (
            <div className="text-center my-4">
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading items...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <h5 className="mb-3">Bill Items</h5>

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

            {/* Items Table */}
            <div className="table-responsive mb-3">
                <table className="table table-sm table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Product</th>
                            <th className="text-end">Price</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-end">Subtotal</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billItems.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center text-muted py-3">
                                    No items added yet. Add products below.
                                </td>
                            </tr>
                        ) : (
                            billItems.map(item => {
                                const product = getProductDetails(item.productId);
                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{product?.name || 'Unknown Product'}</strong>
                                            {product?.description && (
                                                <div className="small text-muted">
                                                    {product.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-end">${product?.price?.toFixed(2) || '0.00'}</td>
                                        <td className="text-center">
                                            <span className="badge bg-secondary">{item.quantity}</span>
                                        </td>
                                        <td className="text-end">
                                            <strong>${getItemSubtotal(item)}</strong>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveItem(item.id)}
                                                title="Remove item"
                                            >
                                                <i className="bi bi-trash"></i> Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    {billItems.length > 0 && (
                        <tfoot className="table-light">
                            <tr>
                                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                <td className="text-end">
                                    <strong className="text-primary fs-5">${getTotalAmount()}</strong>
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Add Item Form */}
            <div className="card bg-light">
                <div className="card-body">
                    <h6 className="card-title mb-3">Add New Item</h6>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-5">
                            <label className="form-label small">Product</label>
                            <select
                                className="form-select"
                                value={newItem.productId}
                                onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                                disabled={adding}
                            >
                                <option value="">-- Select Product --</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - ${product.price?.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Quantity</label>
                            <input
                                type="number"
                                className="form-control"
                                min="1"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                disabled={adding}
                            />
                        </div>
                        <div className="col-md-4">
                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                onClick={handleAddItem}
                                disabled={adding || !newItem.productId}
                            >
                                {adding ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Add Item
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillItemsSection;