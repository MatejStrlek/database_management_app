import axios from "axios";

const API_URL = 'http://localhost:3000';

export const getBillsByCustomerId = async (customerId, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/Bill`, {
        params: {
            customerId: customerId,
            _page: page,
            _limit: limit,
            _sort: 'date',
            _order: 'desc'
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return {
        bills: response.data,
        total: parseInt(response.headers['x-total-count'], 10)
    };
};

export const getBillById = async (billId) => {
    const response = await axios.get(`${API_URL}/Bill/${billId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const createBill = async (billData) => {
    const response = await axios.post(`${API_URL}/Bill`, billData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateBill = async (billId, billData) => {
    const response = await axios.put(`${API_URL}/Bill/${billId}`, billData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const deleteBill = async (billId) => {
    const response = await axios.delete(`${API_URL}/Bill/${billId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};