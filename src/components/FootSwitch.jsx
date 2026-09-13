export default function FootSwitch({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={on ? 'Turn synthesizer off' : 'Turn synthesizer on'}
      aria-pressed={on}
      className="footswitch-outer flex items-center justify-center p-[6px] cursor-pointer"
      style={{ width: 96, height: 96 }}
    >
      <div className="footswitch-ring flex items-center justify-center w-full h-full p-[8px]">
        <div className={`footswitch-cap w-full h-full ${on ? 'pressed' : ''}`} />
      </div>
    </button>
  )
}
