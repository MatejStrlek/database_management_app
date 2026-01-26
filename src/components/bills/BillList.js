import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBillsByCustomerId, deleteBill } from '../../services/billService';
import { fetchCustomerById } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { getAllCreditCards } from '../../services/creditCardService';
import { formatCurrency } from '../../utils/formatters';
import { getSortIcon } from '../../utils/sortHelper';
import Pagination from '../common/Pagination';

const BillList = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [creditCards, setCreditCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalBills, setTotalBills] = useState(0);

    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchCustomer();
        fetchCreditCards();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    useEffect(() => {
        fetchBills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId, currentPage, itemsPerPage]);

    const fetchCustomer = async () => {
        try {
            const data = await fetchCustomerById(customerId);
            setCustomer(data);
        } catch (err) {
            setError('Failed to fetch customer details.');
            console.error(err);
        }
    };

    const fetchCreditCards = async () => {
        try {
            const cards = await getAllCreditCards();
            setCreditCards(cards);
        } catch (err) {
            console.error('Failed to fetch credit cards:', err);
        }
    };

    const fetchBills = async () => {
        setLoading(true);
        try {
            const { bills: billsData, total } = await getBillsByCustomerId(customerId, currentPage, itemsPerPage);
            setBills(billsData);
            setTotalBills(total);
            setError(null);
        } catch (err) {
            setError('Failed to fetch bills.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sortData = (data, field, order) => {
        return [...data].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            if (field === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return order === 'asc' ? aVal - bVal : bVal - aVal;
            }

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
        const sortedBills = sortData(bills, field, order);
        setBills(sortedBills);
    };

    const handleDelete = async (billId) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                await deleteBill(billId);
                fetchBills();
            } catch (err) {
                setError('Failed to delete bill.');
                console.error(err);
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getCreditCardType = (creditCardId) => {
        if (!creditCardId) {
            return <span className="badge bg-secondary">Cash</span>;
        }

        const card = creditCards.find(card => card.id === creditCardId);
        if (!card) {
            return <span className="badge bg-warning">Unknown</span>;
        }

        const cardTypeColors = {
            'visa': 'bg-primary',
            'mastercard': 'bg-danger',
            'american_express': 'bg-info',
            'discover': 'bg-success',
            'jcb': 'bg-warning',
            'diners_club': 'bg-dark',
            'maestro': 'bg-secondary'
        };

        const cardTypeNames = {
            'visa': 'Visa',
            'mastercard': 'Mastercard',
            'american_express': 'American Express',
            'discover': 'Discover',
            'jcb': 'JCB',
            'diners_club': 'Diners Club',
            'maestro': 'Maestro'
        };

        const colorClass = cardTypeColors[card.type] || 'bg-secondary';
        const displayName = cardTypeNames[card.type] || card.type;
        return <span className={`badge ${colorClass}`}>{displayName}</span>;
    };

    if (loading && !bills.length) {
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
            <h2>Bills for {customer ? customer.name : 'Customer'}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    {user && (
                        <Link to={`/bills/new/${customerId}`} className="btn btn-success me-2">
                            Add New Bill
                        </Link>
                    )}
                    <button className="btn btn-primary" onClick={() => navigate('/customers')}>
                        Back to Customers
                    </button>
                </div>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID {getSortIcon('id', sortField, sortOrder)}</th>
                        <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Date {getSortIcon('date', sortField, sortOrder)}</th>
                        <th onClick={() => handleSort('total')} style={{ cursor: 'pointer' }}>Amount {getSortIcon('total', sortField, sortOrder)}</th>
                        <th>Payment Method</th>
                        <th>Comment</th>
                        {user && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {bills.length === 0 ? (
                        <tr>
                            <td colSpan={user ? 5 : 4} className="text-center">No bills found.</td>
                        </tr>
                    ) : (
                        bills.map((bill) => (
                            <tr key={bill.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/bills/edit/${bill.id}`)}
                            >
                                <td>{bill.id}</td>
                                <td>{formatDate(bill.date)}</td>
                                <td>{formatCurrency(bill.total)}</td>
                                <td>{getCreditCardType(bill.creditCardId)}</td>
                                <td>{bill.comment}</td>
                                {user && (
                                    <td>
                                        <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(bill.id); }}>Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalBills / itemsPerPage)}
                onPageChange={(page) => setCurrentPage(page)}
                itemsPerPage={itemsPerPage}
                totalItems={totalBills}
                onItemsPerPageChange={(size) => setItemsPerPage(size)}
            />
        </div>
    );
}

export default BillList;