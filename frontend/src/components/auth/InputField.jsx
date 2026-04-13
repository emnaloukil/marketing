// src/components/auth/InputField.jsx
// Champ de formulaire complet — label, icône, état, erreur, password toggle

import { useState } from 'react'

const InputField = ({
  label,
  name,
  type        = 'text',
  value,
  onChange,
  placeholder = '',
  icon,
  error,
  hint,
  required    = false,
  disabled    = false,
  autoComplete,
  accentColor = '#9B8EFF',
  style: extra = {},
}) => {
  const [focused, setFocused]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type
  const hasError   = !!error
  const hasValue   = value && value.length > 0

  // Couleur de bordure selon état
  const borderColor = hasError
    ? '#FF6B6B'
    : focused
      ? accentColor
      : hasValue
        ? `${accentColor}60`
        : '#E2DFF2'

  const shadowColor = hasError
    ? 'rgba(255,107,107,0.12)'
    : focused
      ? `${accentColor}18`
      : 'transparent'

  return (
    <div style={{ ...styles.wrapper, ...extra }}>

      {/* Label */}
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.asterisk}> *</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div style={{
        ...styles.inputWrap,
        borderColor,
        boxShadow:   `0 0 0 4px ${shadowColor}`,
        background:  disabled ? '#F5F4FA' : focused ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.85)',
      }}>

        {/* Icon gauche */}
        {icon && (
          <span style={{
            ...styles.iconLeft,
            color: focused ? accentColor : hasError ? '#FF6B6B' : '#B0AACB',
          }}>
            {icon}
          </span>
        )}

        {/* Input */}
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          style={{
            ...styles.input,
            paddingLeft:  icon ? 44 : 16,
            paddingRight: isPassword ? 48 : 16,
            cursor:       disabled ? 'not-allowed' : 'text',
            color:        disabled ? '#9E99B8' : '#1A1830',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            style={styles.eyeBtn}
            onClick={() => setShowPass(p => !p)}
            tabIndex={-1}
          >
            <span style={{ fontSize: 17, lineHeight: 1 }}>
              {showPass ? '🙈' : '👁️'}
            </span>
          </button>
        )}

        {/* Checkmark si valide */}
        {!hasError && hasValue && !isPassword && !focused && (
          <span style={{ ...styles.iconRight, color: '#4ECDC4' }}>✓</span>
        )}

      </div>

      {/* Message erreur / hint */}
      {hasError && (
        <div style={styles.errorMsg}>
          <span style={{ fontSize: 13 }}>⚠️</span>
          {error}
        </div>
      )}
      {hint && !hasError && (
        <p style={styles.hint}>{hint}</p>
      )}

    </div>
  )
}

const styles = {
  wrapper: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
  },
  label: {
    fontFamily:    "'Nunito', sans-serif",
    fontSize:      '0.86rem',
    fontWeight:    700,
    color:         '#4A4666',
    letterSpacing: '0.01em',
  },
  asterisk: {
    color: '#FF6B6B',
  },
  inputWrap: {
    position:     'relative',
    borderRadius: 14,
    border:       '2px solid',
    transition:   'all 220ms ease',
    backdropFilter: 'blur(8px)',
  },
  iconLeft: {
    position:      'absolute',
    left:          14,
    top:           '50%',
    transform:     'translateY(-50%)',
    fontSize:      18,
    pointerEvents: 'none',
    transition:    'color 200ms ease',
    lineHeight:    1,
  },
  iconRight: {
    position:      'absolute',
    right:         14,
    top:           '50%',
    transform:     'translateY(-50%)',
    fontSize:      16,
    fontWeight:    700,
    pointerEvents: 'none',
  },
  input: {
    width:       '100%',
    height:      50,
    background:  'transparent',
    border:      'none',
    outline:     'none',
    fontFamily:  "'Nunito', sans-serif",
    fontSize:    '0.95rem',
    fontWeight:  600,
    transition:  'color 200ms ease',
  },
  eyeBtn: {
    position:   'absolute',
    right:      12,
    top:        '50%',
    transform:  'translateY(-50%)',
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    padding:    '4px 6px',
    display:    'flex',
    alignItems: 'center',
    lineHeight: 1,
  },
  errorMsg: {
    display:    'flex',
    alignItems: 'center',
    gap:        6,
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.80rem',
    fontWeight: 700,
    color:      '#FF6B6B',
    animation:  'fadeInUp 0.2s ease both',
  },
  hint: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.78rem',
    fontWeight: 500,
    color:      '#B0AACB',
  },
}

export default InputField