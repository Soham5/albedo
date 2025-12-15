import React from 'react';
import './DatePicker.css';

const DatePicker = ({ label, value, onChange, required = false }) => {
  return (
    <div className="date-picker">
      {label && (
        <label className="date-picker-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="date-picker-input"
      />
    </div>
  );
};

export default DatePicker;
