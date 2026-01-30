import axios from "axios";

const API_URL = 'http://localhost:3000';

export const getAllSellers = async () => {
    const response = await axios.get(`${API_URL}/Seller`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getSellerById = async (sellerId) => {
    const response = await axios.get(`${API_URL}/Seller/${sellerId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};