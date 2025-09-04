
import { useState, useEffect, useCallback, useRef } from 'react'

// Common loading state pattern
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback((errorMessage?: string) => {
    setIsLoading(false)
    if (errorMessage) {
      setError(errorMessage)
    }
  }, [])

  const resetState = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    resetState,
    hasError: !!error
  }
}

// Common async operation pattern
export function useAsyncOperation<T = any>() {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await operation()
      if (mountedRef.current) {
        setData(result)
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed'
      if (mountedRef.current) {
        setError(errorMessage)
      }
      throw err
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    hasData: !!data,
    hasError: !!error
  }
}

// Common toggle state pattern
export function useToggleState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  }
}

// Common form state pattern
export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isDirty, setIsDirty] = useState(false)

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }, [errors])

  const setError = useCallback(<K extends keyof T>(key: K, error: string) => {
    setErrors(prev => ({ ...prev, [key]: error }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsDirty(false)
  }, [initialValues])

  const hasErrors = Object.values(errors).some(error => !!error)

  return {
    values,
    errors,
    isDirty,
    hasErrors,
    setValue,
    setError,
    clearErrors,
    reset
  }
}

// Common timer pattern
export function useTimer(initialTime = 0) {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number>()

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
      intervalRef.current = window.setInterval(() => {
        setTime(prev => prev + 1)
      }, 1000)
    }
  }, [isRunning])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setTime(initialTime)
  }, [stop, initialTime])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    time,
    isRunning,
    start,
    stop,
    reset,
    formattedTime: `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`
  }
}

// Common debounced value pattern
export function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Common local storage pattern
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

// Common intersection observer pattern
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [options])

  return [targetRef, isIntersecting] as const
}
