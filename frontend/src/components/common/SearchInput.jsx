export default function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ padding: 8, minWidth: 260 }}
    />
  );
}
