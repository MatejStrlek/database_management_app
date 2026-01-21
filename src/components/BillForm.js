import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createBill, getBillById, updateBill } from '../services/billService';
import { fetchCustomerById } from '../services/customerService';
import { getAllCreditCards } from '../services/creditCardService';
import { useAuth } from '../context/AuthContext';
import BillItemsSection from './BillItemsSection';
import { getSellerById, getAllSellers } from '../services/sellerService';

const BillForm = () => {
    const { billId, customerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isEditMode = Boolean(billId);
    const [billData, setBillData] = useState({
        guid: '',
        billNumber: '',
        date: new Date().toISOString().split('T')[0],
        customerId: customerId ? parseInt(customerId, 10) : null,
        creditCardId: '',
        comment: '',
        total: 0,
    });

    const [customer, setCustomer] = useState(null);
    const [seller, setSeller] = useState(null);
    const [sellers, setSellers] = useState([]);
    const [creditCards, setCreditCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            window.history.replaceState({}, document.title);
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const generateBillNumber = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetters = letters.charAt(Math.floor(Math.random() * 26)) +
            letters.charAt(Math.floor(Math.random() * 26));
        const randomNumbers = Math.floor(10000000 + Math.random() * 90000000).toString();
        return randomLetters + randomNumbers;
    };

    const generateGuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    const loadCustomer = useCallback(async (id) => {
        try {
            const customer = await fetchCustomerById(id);
            setCustomer(customer);
        } catch (err) {
            setError('Failed to load customer data.');
        }
    }, []);

    const loadSeller = useCallback(async (id) => {
        try {
            const seller = await getSellerById(id);
            setSeller(seller);
        } catch (err) {
            setError('Failed to load seller data.');
        }
    }, []);

    const loadSellers = useCallback(async () => {
        try {
            const allSellers = await getAllSellers();
            setSellers(allSellers);
        } catch (err) {
            setError('Failed to load sellers.');
        }
    }, []);

    const loadCreditCards = useCallback(async () => {
        try {
            const cards = await getAllCreditCards();
            setCreditCards(cards);
        } catch (err) {
            setError('Failed to load credit cards.');
        }
    }, []);

    const loadBill = useCallback(async (id) => {
        if (!billId) return;

        try {
            const bill = await getBillById(id);

            console.log('Loaded bill:', bill);  // DEBUG
            console.log('Bill sellerId:', bill.sellerId);  // DEBUG

            setBillData({
                guid: bill.guid || '',
                billNumber: bill.billNumber || '',
                date: bill.date ? bill.date.split('T')[0] : new Date().toISOString().split('T')[0],
                customerId: bill.customerId || null,
                creditCardId: bill.creditCardId || '',
                comment: bill.comment || '',
                total: bill.total || 0,
            });

            if (bill.customerId) {
                await loadCustomer(bill.customerId);
            }
            if (bill.sellerId) {
                await loadSeller(bill.sellerId);
            }
        } catch (err) {
            setError('Failed to load bill data.');
        }
    }, [billId, loadCustomer]);

    useEffect(() => {
        const initializeForm = async () => {
            try {
                if (!isEditMode && customerId) {
                    await loadCustomer(parseInt(customerId, 10));
                }
                await Promise.all([loadCreditCards(), loadSellers()]);
                if (isEditMode) {
                    await loadBill(billId);
                } else {
                    setBillData((prevData) => ({
                        ...prevData,
                        guid: generateGuid(),
                        billNumber: generateBillNumber(),
                        customerId: customerId ? parseInt(customerId, 10) : prevData.customerId,
                    }));
                }
            } finally {
                setLoading(false);
            }
        };

        initializeForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBillData(prev => ({
            ...prev,
            [name]:
                name === 'total'
                    ? (value === '' ? '' : parseFloat(value))
                    : name === 'creditCardId'
                        ? (value === '' ? '' : parseInt(value, 10))
                        : value,
        }));
    };

    const handleTotalChange = useCallback((newTotal) => {
        setBillData(prev => {
            if (prev.total !== newTotal) {
                return {
                    ...prev,
                    total: newTotal
                };
            }
            return prev;
        });
    }, []);

    const handleSellerChange = async (e) => {
        const { value } = e.target;
        const newSellerId = value === '' ? null : parseInt(value, 10);

        setBillData(prev => ({
            ...prev,
            sellerId: newSellerId
        }));

        if (value) {
            await loadSeller(newSellerId);
        } else {
            setSeller(null);
        }

        if (isEditMode && billId) {
            try {
                const currentBill = await getBillById(billId);
                const payload = {
                    ...currentBill,
                    sellerId: newSellerId,
                };
                await updateBill(billId, payload);
                setSuccessMessage('Seller updated successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err) {
                console.error('Failed to update seller:', err);
                setError('Failed to update seller.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (!billData.billNumber) {
                setError('Bill number is required.');
                setSaving(false);
                return;
            }

            const payload = {
                ...billData,
                date: new Date(billData.date).toISOString(),
                customerId: billData.customerId,
                creditCardId: billData.creditCardId || null,
                total: parseFloat(billData.total) || 0,
            };

            if (isEditMode) {
                await updateBill(billId, payload);
                navigate(`/customers/${billData.customerId}/bills`);
            } else {
                const createdBill = await createBill(payload);
                navigate(`/bills/edit/${createdBill.id}`, {
                    state: { message: 'Bill created! Now add items to the bill.' }
                });
            }
        } catch (err) {
            setError('Failed to save bill. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                {isEditMode ? 'Edit Bill' : 'New Bill'}
                            </h2>
                            {successMessage && (
                                <div className="alert alert-success alert-dismissible fade show" role="alert">
                                    <i className="bi bi-check-circle me-2"></i>
                                    {successMessage}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setSuccessMessage(null)}
                                    ></button>
                                </div>
                            )}
                            {error && <div className="alert alert-danger">{error}</div>}
                            {customer && (
                                <div className="alert alert-info">
                                    <strong>Customer:</strong> {customer.name} {customer.surname}
                                    <br />
                                    <small>{customer.email}</small>
                                </div>
                            )}
                            <div className="mb-3">
                                {seller && (
                                    <div className="alert alert-success mb-2">
                                        <strong>Current Seller:</strong> {seller.name} {seller.surname}
                                        <br />
                                        <small>{seller.PermanentEmployee ? 'Permanent Employee' : 'Temporary Employee'}</small>
                                    </div>
                                )}
                                <label htmlFor="sellerId" className="form-label">
                                    {seller ? 'Change Seller' : 'Assign Seller'} <span className="text-muted">(optional)</span>
                                </label>
                                <select
                                    className="form-select"
                                    id="sellerId"
                                    name="sellerId"
                                    value={billData.sellerId || ''}
                                    onChange={handleSellerChange}
                                >
                                    <option value="">-- Select Seller --</option>
                                    {sellers.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.surname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="billNumber" className="form-label">Bill Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="billNumber"
                                        name="billNumber"
                                        value={billData.billNumber}
                                        onChange={handleChange}
                                        required
                                        readOnly={isEditMode}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="date" className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="date"
                                        name="date"
                                        value={billData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="total" className="form-label">Total</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="total"
                                        name="total"
                                        value={billData.total}
                                        onChange={handleChange}
                                        readOnly={isEditMode}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="creditCardId" className="form-label">Payment method (if empty, cash)</label>
                                    <select
                                        className="form-select"
                                        id="creditCardId"
                                        name="creditCardId"
                                        value={billData.creditCardId || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Select Credit Card --</option>
                                        {creditCards.map(card => (
                                            <option key={card.id} value={card.id}>
                                                {card.type} - ****{card.cardNumber?.slice(-4)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="comment" className="form-label">Comment</label>
                                    <textarea
                                        className="form-control"
                                        id="comment"
                                        name="comment"
                                        rows="3"
                                        value={billData.comment}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                {isEditMode && (
                                    <>
                                        <hr className='my-4' />
                                        <BillItemsSection
                                            billId={billId}
                                            onTotalChange={handleTotalChange}
                                        />
                                        <hr className='my-4' />
                                    </>
                                )}
                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            isEditMode ? 'Update Bill' : 'Create Bill'
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

export default BillForm;