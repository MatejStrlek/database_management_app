import axios from "axios";

const API_URL = 'http://localhost:3000';

export const getBillItemsByBillId = async (billId) => {
    const response = await axios.get(`${API_URL}/Item`, {
        params: {
            billId: billId
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const createBillItem = async (billItemData) => {
    const response = await axios.post(`${API_URL}/Item`, billItemData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateBillItem = async (billItemId, billItemData) => {
    const response = await axios.put(`${API_URL}/Item/${billItemId}`, billItemData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const deleteBillItem = async (billItemId) => {
    const response = await axios.delete(`${API_URL}/Item/${billItemId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};