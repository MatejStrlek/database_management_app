import axios from "axios";

const API_URL = 'http://localhost:3000';

export const getCreditCardById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/CreditCard/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching credit card:', error);
        return null;
    }
};

export const getAllCreditCards = async () => {
    try {
        const response = await axios.get(`${API_URL}/CreditCard`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('CreditCard data:', response.data); // Debugging log

        return response.data;
    } catch (error) {
        console.error('Error fetching credit cards:', error);
        return [];
    }
};