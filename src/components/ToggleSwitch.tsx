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
    <div className="relative inline-block w-10 align-middle select-none">
      <input
        checked={checked}
        className="toggle-checkbox absolute block w-0 h-0 opacity-0"
        id={`toggle-${Math.random()}`}
        name="toggle"
        type="checkbox"
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label
        className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors relative ${
          checked
            ? 'bg-primary-container shadow-[0_0_10px_rgba(160,120,255,0.4)]'
            : 'bg-slate-700'
        }`}
        htmlFor={String(Math.random())}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </label>
    </div>
  )
}
