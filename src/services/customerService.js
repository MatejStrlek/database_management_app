import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL = 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const fetchCustomers = async (page = 1, limit = 10, sort = '', search = '') => {
    let url = `/Customer?_page=${page}&_limit=${limit}`;

    if (sort) {
        const [field, order] = sort.split(',');
        url += `&_sort=${field}&_order=${order}`;
    }
    if (search) {
        url += `&q=${search}`;
    }

    const response = await axiosInstance.get(url);
    return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0', 10),
    };
};

export const fetchCustomerById = async (id) => {
    const response = await axiosInstance.get(`/Customer/${id}`);
    return response.data;
};

export const createCustomer = async (customerData) => {
    const response = await axiosInstance.post('/Customer', customerData);
    return response.data;
};

export const updateCustomer = async (id, customerData) => {
    const response = await axiosInstance.put(`/Customer/${id}`, customerData);
    return response.data;
};

export const deleteCustomer = async (id) => {
    const response = await axiosInstance.delete(`/Customer/${id}`);
    return response.data;
};

export const fetchCities = async () => {
    const response = await axiosInstance.get('/City');
    return response.data;
};