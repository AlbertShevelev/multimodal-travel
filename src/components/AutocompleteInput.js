import React, { useMemo, useState } from "react";
import "../styles/AutocompleteInput.css";

const AutocompleteInput = ({
  value,
  onChange,
  suggestions = [],
  placeholder = "",
  maxItems = 8,
}) => {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, maxItems);
    return suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, maxItems);
  }, [value, suggestions, maxItems]);

  const handleSelect = (city) => {
    onChange(city);
    setOpen(false);
  };

  return (
    <div className="ac-wrapper">
      <input
        className="ac-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        autoComplete="off"
      />

      {open && filtered.length > 0 && (
        <ul className="ac-list">
          {filtered.map((city, idx) => (
            <li
              key={idx}
              className="ac-item"
              onMouseDown={() => handleSelect(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
