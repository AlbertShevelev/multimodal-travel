import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/AutocompleteInput.css";

const AutocompleteInput = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapperRef = useRef(null);

  useEffect(() => setQuery(value || ""), [value]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options
      .filter((opt) => opt.toLowerCase().includes(q))
      .slice(0, 8);
  }, [options, query]);

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
  };

  return (
    <div className="ac-wrapper" ref={wrapperRef}>
      <input
        className="input-field ac-input"
        type="text"
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
      />

      {open && filtered.length > 0 && (
        <div className="ac-dropdown">
          {filtered.map((opt) => (
            <div
              key={opt}
              className="ac-item"
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
