import { useState, useEffect } from 'react';
import { Customer } from '../../../types';
import { MOCK_CUSTOMERS } from '../../../constants';

export const useCustomerLogic = (playSound: (type: 'success' | 'click') => void) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_customers');
    setCustomers(saved ? JSON.parse(saved) : MOCK_CUSTOMERS);
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_customers', JSON.stringify(customers));
  }, [customers]);

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
    playSound('success');
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    if (selectedCustomer?.id === customer.id) setSelectedCustomer(customer);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    if (selectedCustomer?.id === id) setSelectedCustomer(null);
  };

  return {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
};