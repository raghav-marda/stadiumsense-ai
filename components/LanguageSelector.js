import { SUPPORTED_LANGUAGES } from "../lib/stadiumData";

/**
 * LanguageSelector — dropdown for the fan assistant's reply language.
 * @param {Object} props
 * @param {string} props.value - currently selected language label
 * @param {(label: string) => void} props.onChange
 */
export default function LanguageSelector({ value, onChange }) {
  return (
    <label className="stack" style={{ gap: 6 }}>
      <span className="field-label">Language</span>
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Choose your language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.label}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
