'use client';

interface YearSelectProps {
    value: number | '';
    onChange: (year: number) => void;
    disabled?: boolean;
}

export default function YearSelect({ value, onChange, disabled }: YearSelectProps) {
    const years = Array.from({ length: 60 }, (_, i) => 2024 - i);

    return (
        <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className={`p-2 border rounded-md text-base bg-white dark:bg-black border-gray-200 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
            <option value="" disabled>Year</option>
            {years.map((y) => (
                <option key={y} value={y}>
                    {y}
                </option>
            ))}
        </select>
    );
}
