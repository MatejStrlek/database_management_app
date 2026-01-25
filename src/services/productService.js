import axios from "axios";

const API_URL = 'http://localhost:3000';

export const getAllProducts = async () => {
    const response = await axios.get(`${API_URL}/Product`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getProductById = async (productId) => {
    const response = await axios.get(`${API_URL}/Product/${productId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await axios.post(`${API_URL}/Product`, productData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateProduct = async (productId, productData) => {
    const response = await axios.put(`${API_URL}/Product/${productId}`, productData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const deleteProduct = async (productId) => {
    const response = await axios.delete(`${API_URL}/Product/${productId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};