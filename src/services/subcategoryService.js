import axios from "axios";

const API_URL = 'http://localhost:3000';

export const getAllSubcategories = async () => {
    const response = await axios.get(`${API_URL}/SubCategory`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};