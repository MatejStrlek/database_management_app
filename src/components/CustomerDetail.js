import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCustomerById, deleteCustomer, fetchCities } from '../services/customerService';
import { useAuth } from '../context/AuthContext';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
            if (!user) {
                navigate('/login', { replace: true });
                return;
            }
        }, [user, navigate]);

    const loadCustomer = useCallback(async () => {
        try {
            setLoading(true);
            const customerData = await fetchCustomerById(id);
            const cities = await fetchCities();
            const customerCity = cities.find(city => city.id == customerData.cityId);
            const customerWithCity = { ...customerData, City: customerCity || null };
            setCustomer(customerWithCity);
        } catch (err) {
            setError('Failed to load customer details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadCustomer();
    }, [loadCustomer]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await deleteCustomer(id);
                navigate('/customers');
            } catch (err) {
                setError('Failed to delete customer');
                console.error(err);
            }
        }
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

    if (error || !customer) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error || 'Customer not found'}
                </div>
                <div className="text-center">
                    <Link to="/customers" className="btn btn-secondary">
                        Back to List
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h3 className="mb-0">Customer Details</h3>
                            <Link to="/customers" className="btn btn-outline-light btn-sm">
                                Back
                            </Link>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold text-muted">First Name:</label>
                                    <p className="fs-5">{customer.name}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold text-muted">Last Name:</label>
                                    <p className="fs-5">{customer.surname}</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold text-muted">Email:</label>
                                    <p className="fs-5">
                                        {customer.email}
                                    </p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold text-muted">Phone:</label>
                                    <p className="fs-5">
                                        {customer.telephone}
                                    </p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold text-muted">Customer ID:</label>
                                    <p className="fs-6 text-secondary">{customer.id}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold text-muted">City:</label>
                                    <p className="fs-5">{customer.City?.name || 'N/A'}</p>
                                </div>
                            </div>

                            {user && (
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <hr />
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Link
                                                to={`/customers/edit/${customer.id}`}
                                                className="btn btn-warning"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={handleDelete}
                                                className="btn btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;