// src/components/shared/Input.jsx
// Input réutilisable avec label, icône et états

import { useState } from 'react'

const Input = ({
  label,
  type        = 'text',
  value,
  onChange,
  placeholder = '',
  icon,
  error,
  hint,
  disabled    = false,
  required    = false,
  name,
  autoComplete,
  style: extraStyle = {},
}) => {
  const [focused, setFocused] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div style={{ ...styles.wrapper, ...extraStyle }}>
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}> *</span>}
        </label>
      )}

      <div style={{
        ...styles.inputWrap,
        ...(focused && styles.inputWrapFocused),
        ...(error   && styles.inputWrapError),
        ...(disabled && styles.inputWrapDisabled),
      }}>
        {icon && (
          <span style={{
            ...styles.iconLeft,
            color: focused ? '#9B8EFF' : '#9E99B8',
          }}>
            {icon}
          </span>
        )}

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          style={{
            ...styles.input,
            paddingLeft:  icon ? 40 : 16,
            paddingRight: isPassword ? 44 : 16,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {isPassword && (
          <button
            type="button"
            style={styles.eyeBtn}
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {hint && !error && <p style={styles.hint}>{hint}</p>}
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
    fontFamily:  "'Nunito', sans-serif",
    fontSize:    '0.88rem',
    fontWeight:  700,
    color:       '#4A4666',
    letterSpacing: '0.01em',
  },
  required: {
    color: '#FF6B6B',
  },
  inputWrap: {
    position:     'relative',
    background:   'rgba(255,255,255,0.85)',
    border:       '2px solid #E2DFF2',
    borderRadius: 14,
    transition:   'all 250ms ease',
    backdropFilter: 'blur(8px)',
  },
  inputWrapFocused: {
    border:    '2px solid #9B8EFF',
    boxShadow: '0 0 0 4px rgba(155,142,255,0.12)',
    background: 'rgba(255,255,255,0.95)',
  },
  inputWrapError: {
    border:    '2px solid #FF6B6B',
    boxShadow: '0 0 0 4px rgba(255,107,107,0.10)',
  },
  inputWrapDisabled: {
    opacity:  0.6,
    cursor:   'not-allowed',
    background: '#F0EEF8',
  },
  iconLeft: {
    position:  'absolute',
    left:      13,
    top:       '50%',
    transform: 'translateY(-50%)',
    fontSize:  17,
    transition: 'color 200ms ease',
    pointerEvents: 'none',
  },
  input: {
    width:       '100%',
    height:      48,
    background:  'transparent',
    border:      'none',
    fontFamily:  "'Nunito', sans-serif",
    fontSize:    '0.95rem',
    fontWeight:  500,
    color:       '#2D2A45',
    outline:     'none',
  },
  eyeBtn: {
    position:   'absolute',
    right:      12,
    top:        '50%',
    transform:  'translateY(-50%)',
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    fontSize:   16,
    padding:    4,
    lineHeight: 1,
  },
  error: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.80rem',
    fontWeight: 600,
    color:      '#FF6B6B',
  },
  hint: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.80rem',
    color:      '#9E99B8',
  },
}

export default Input