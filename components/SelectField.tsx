
import React from 'react';

interface SelectFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, options }) => {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-400">{label}</label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition duration-200 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-800 text-gray-200">
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectField;
