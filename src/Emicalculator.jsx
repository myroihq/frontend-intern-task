import React, { useState } from "react";
import styles from "./EMICalculator.module.css";

// Utility function to generate EMI breakdown
const generateBreakdown = (P, R, N, EMI) => {
  let balance = P;
  const breakdown = [];

  for (let i = 1; i <= N; i++) {
    const interest = balance * R;
    const principal = EMI - interest;
    balance -= principal;

    breakdown.push({
      month: i,
      emiPaid: EMI.toFixed(2),
      interestPaid: interest.toFixed(2),
      principalPaid: principal.toFixed(2),
      balance: balance > 0 ? balance.toFixed(2) : 0,
    });

    if (balance <= 0) break;
  }

  return breakdown;
};

// Utility function to download CSV
const downloadCSV = (breakdown) => {
  const headers = [
    "Month",
    "EMI Paid",
    "Interest Paid",
    "Principal Paid",
    "Balance",
  ];
  const csvContent = [
    headers.join(","),
    ...breakdown.map(
      ({ month, emiPaid, interestPaid, principalPaid, balance }) =>
        [month, emiPaid, interestPaid, principalPaid, balance].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "emi_breakdown.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTenure, setLoanTenure] = useState("");
  const [prepayment, setPrepayment] = useState("");
  const [results, setResults] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const calculateEMI = () => {
    if (!loanAmount || !interestRate || !loanTenure) {
      alert("Please fill in all required fields");
      return;
    }

    const P = parseFloat(loanAmount);
    const R = parseFloat(interestRate) / 12 / 100;
    const N = parseFloat(loanTenure) * 12;

    const EMI = P * R * (Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1));
    const totalInterest = EMI * N - P;
    const totalAmount = EMI * N;

    setResults({
      emi: EMI.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    });

    const breakdown = generateBreakdown(P, R, N, EMI);
    setBreakdown(breakdown);
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}>
      <div className={styles.card}>
        <div className={styles.top}>
          <h2 className={styles.cardTitle}>EMI Calculator</h2>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
        <div className={styles.inputGrid}>
          <input
            type="number"
            placeholder="Loan Amount"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value>0 && e.target.value)}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value>0 && e.target.value)}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Loan Tenure (years)"
            value={loanTenure}
            onChange={(e) => setLoanTenure(e.target.value>0 && e.target.value)}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Prepayment (optional)"
            value={prepayment}
            onChange={(e) => setPrepayment(e.target.value>0 && e.target.value)}
            className={styles.input}
          />
        </div>
        <button onClick={calculateEMI} className={styles.button}>
          Calculate EMI
        </button>
      </div>

      {results && (
        <div className={styles.resultsCard}>
          <h2 className={styles.cardTitle}>Results</h2>
          <p>Monthly EMI: ₹{results.emi}</p>
          <p>Total Interest: ₹{results.totalInterest}</p>
          <p>Total Amount: ₹{results.totalAmount}</p>
        </div>
      )}

      {breakdown.length > 0 && (
        <div className={styles.breakdownCard}>
          <h2 className={styles.cardTitle}>Month-wise Breakdown</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>EMI Paid</th>
                  <th>Interest Paid</th>
                  <th>Principal Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map(
                  ({
                    month,
                    emiPaid,
                    interestPaid,
                    principalPaid,
                    balance,
                  }) => (
                    <tr key={month}>
                      <td>{month}</td>
                      <td>{emiPaid}</td>
                      <td>{interestPaid}</td>
                      <td>{principalPaid}</td>
                      <td>{balance}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => downloadCSV(breakdown)}
            className={`${styles.button} ${styles.downloadButton}`}
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;
