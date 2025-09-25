import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useLocation, useNavigate } from "react-router-dom"; // 1. ADDED: Import hooks
import { toast } from 'react-toastify'; // 2. ADDED: Import toast
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const DashboardPage = () => {
  // Your existing state for the chart
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedData, setSelectedData] = useState("amount");
  const [transactionData, setTransactionData] = useState([]);
  
  const location = useLocation(); // 3. ADDED: Get the location object
  const navigate = useNavigate(); // ADDED: To help clear the message state

  // 4. ADDED: This new useEffect handles the success message from Login/Register
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // This line clears the message so it doesn't pop up again on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Your existing useEffect for fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Your ApiService is configured to auto-return the data array
        const transactionsArray = await ApiService.getAllTransactions();

        setTransactionData(
          transformTransactionData(
            transactionsArray, 
            selectedMonth,
            selectedYear
          )
        );
      } catch (error) {
        // Use toast for errors for a consistent UI
        toast.error(
          error.response?.data?.message || "Error getting transactions."
        );
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]); // Removed selectedData, as it doesn't need a re-fetch

  
  // Your existing data transformation logic (unchanged)
  const transformTransactionData = (transactions, month, year) => {
    const daysInMonths = new Date(year, month, 0).getDate();
    const dailyData = {};
    for (let day = 1; day <= daysInMonths; day++) {
      dailyData[day] = { day, count: 0, quantity: 0, amount: 0 };
    }
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();
      if (transactionMonth === month && transactionYear === year) {
        const day = transactionDate.getDate();
        if (dailyData[day]) {
          dailyData[day].count += 1;
          dailyData[day].quantity += transaction.totalProducts;
          dailyData[day].amount += transaction.totalPrice;
        }
      }
    });
    return Object.values(dailyData);
  };

  // Your existing handlers (unchanged)
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  return (
    <Layout>
      {/* The old message div is no longer needed */}
      <div className="dashboard-page">
        <div className="button-group">
          <button onClick={() => setSelectedData("count")}>
            Total No Of Transactions
          </button>
          <button onClick={() => setSelectedData("quantity")}>
            Product Quantity
          </button>
          <button onClick={() => setSelectedData("amount")}>Amount</button>
        </div>

        <div className="dashboard-content">
          <div className="filter-section">
            <label htmlFor="month-select">Select Month:</label>
            <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <label htmlFor="year-select">Select Year:</label>
            <select id="year-select" value={selectedYear} onChange={handleYearChange}>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return ( <option key={year} value={year}> {year} </option> );
              })}
            </select>
          </div>

          <div className="chart-section">
            <div className="chart-container">
              <h3>Daily Transactions</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: "Day", position: "insideBottomRight", offset: -5 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => selectedData === 'amount' ? `$${parseFloat(value).toFixed(2)}` : value} />
                  <Legend />
                  <Line
                    type={"monotone"}
                    dataKey={selectedData}
                    name={selectedData.charAt(0).toUpperCase() + selectedData.slice(1)}
                    stroke="#008080"
                    fillOpacity={0.3}
                    fill="#008080"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;