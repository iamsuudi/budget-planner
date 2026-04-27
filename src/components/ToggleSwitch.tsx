interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <label
      className={`inline-block w-10 h-5 rounded-full cursor-pointer transition-colors relative overflow-hidden ${
        checked
          ? 'bg-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.4)]'
          : 'bg-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        checked={checked}
        className="sr-only"
        type="checkbox"
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </label>
  )
}