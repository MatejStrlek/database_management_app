import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomer, updateCustomer, fetchCities, fetchCustomerById } from '../services/customerService';

const CustomerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [customerData, setCustomerData] = useState({
        name: '',
        surname: '',
        email: '',
        telephone: '',
        cityId: '',
    });

    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCities = useCallback(async () => {
        try {
            const citiesData = await fetchCities();
            setCities(citiesData);
        } catch (err) {
            setError('Failed to load cities');
            console.error(err);
        }
    }, []);

    const fetchCustomerData = useCallback(async (customerId) => {
        try {
            setLoading(true);
            const customer = await fetchCustomerById(customerId);
            setCustomerData({
                name: customer.name || '',
                surname: customer.surname || '',
                email: customer.email || '',
                telephone: customer.telephone || '',
                cityId: customer.cityId || '',
            });
        } catch (err) {
            setError('Failed to load customer data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCities();
        if (isEditMode) {
            fetchCustomerData(id);
        } else {
            setLoading(false);
        }
    }, [id, isEditMode, loadCities, fetchCustomerData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditMode) {
                await updateCustomer(id, customerData);
            } else {
                await createCustomer(customerData);
            }
            navigate('/customers');
        } catch (err) {
            setError('Failed to save customer data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/customers');
    };

    if (loading && isEditMode) {
        return (
            <div className='container mt-5'>
                <div className='text-center'>
                    <div className='spinner-border' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='container mt-5'>
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                            </h2>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={customerData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="surname" className="form-label">
                                        Last Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="surname"
                                        name="surname"
                                        value={customerData.surname}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={customerData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="telephone" className="form-label">
                                        Phone <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="telephone"
                                        name="telephone"
                                        value={customerData.telephone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="cityId" className="form-label">
                                        City
                                    </label>
                                    <select
                                        className="form-select"
                                        id="cityId"
                                        name="cityId"
                                        value={customerData.cityId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a city (optional)</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="d-flex justify-content-between mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={loading}
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
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            isEditMode ? 'Update Customer' : 'Create Customer'
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

export default CustomerForm;