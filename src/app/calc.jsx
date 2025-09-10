"use client";
import React, { useState, useEffect } from "react";

const FARMS = [
  { id: 1, farmNo: 992, paperArea: 5945, actualArea: 6418 },
  { id: 2, farmNo: 991, paperArea: 5209, actualArea: 5246 },
  { id: 3, farmNo: 988, paperArea: 4679, actualArea: 4439 },
  { id: 4, farmNo: 893, paperArea: 4679, actualArea: 4624 },
  { id: 5, farmNo: 894, paperArea: 4557, actualArea: 4518 },
];

// 1 sq mt = 10.7639 sq ft
const SQMT_TO_SQFT = 10.7639;

// formatter for Indian currency
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function LandDealCalculator() {
  const [rate, setRate] = useState(100); // global avg rate
  const [useActual, setUseActual] = useState(true);
  const [farmRates, setFarmRates] = useState(FARMS.map(() => 100)); // per-farm rates
  const [farmValues, setFarmValues] = useState(FARMS.map(() => 0));

  const areas = FARMS.map((farm) =>
    (useActual ? farm.actualArea : farm.paperArea) * SQMT_TO_SQFT
  );
  const totalArea = areas.reduce((sum, a) => sum + a, 0);
  const totalValue = totalArea * rate; // fixed target total

  // Initialize distribution based on avg rate
  useEffect(() => {
    const initialRates = FARMS.map(() => rate);
    setFarmRates(initialRates);
    const initialValues = areas.map((a) => a * rate);
    setFarmValues(initialValues);
  }, [rate, useActual]);

  // When one farm's rate changes
  const handleFarmRateChange = (index, newRate) => {
    const newValues = [...farmValues];
    const newRates = [...farmRates];

    // update chosen farm value
    const newValue = areas[index] * newRate;
    newValues[index] = newValue;
    newRates[index] = newRate;

    // remaining farms must balance
    const remainingTotal = totalValue - newValue;
    const otherIndexes = FARMS.map((_, i) => i).filter((i) => i !== index);

    const remainingAreas = otherIndexes.map((i) => areas[i]);
    const remainingAreaSum = remainingAreas.reduce((sum, a) => sum + a, 0);

    otherIndexes.forEach((i) => {
      newValues[i] = (areas[i] / remainingAreaSum) * remainingTotal;
      newRates[i] = newValues[i] / areas[i]; // adjust their per sq ft rate
    });

    setFarmValues(newValues);
    setFarmRates(newRates);
  };

  return (
    <div className="land-calculator">
      <h2>Land Deal Calculator</h2>

      <div className="controls">
        <label>
          Global Avg Rate (per sq ft):{" "}
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={useActual}
            onChange={(e) => setUseActual(e.target.checked)}
          />
          Use Actual Area
        </label>
      </div>
      <div className="table-wrapper">

        <table border={1} cellPadding={5} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Farm No</th>
              <th>Area (sq mt)</th>
              <th>Area (sq ft)</th>
              <th>Rate (₹/sq ft)</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {FARMS.map((farm, index) => {
              const areaSqMt = useActual ? farm.actualArea : farm.paperArea;
              const areaSqFt = areas[index];
              return (
                <tr key={farm.id}>
                  <td>{farm.farmNo}</td>
                  <td>{areaSqMt.toLocaleString("en-IN")}</td>
                  <td>{areaSqFt.toFixed(0).toLocaleString("en-IN")}</td>
                  <td>
                    <input
                      type="number"
                      value={farmRates[index].toFixed(2)}
                      onChange={(e) =>
                        handleFarmRateChange(index, Number(e.target.value))
                      }
                      style={{ width: "90px" }}
                    />
                  </td>
                  <td>{formatCurrency(farmValues[index])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h3 className="total-value">Total Value: {formatCurrency(totalValue)}</h3>
    </div>

  );
}
