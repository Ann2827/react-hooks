import React from 'react';

const useStoredValue = <T>(value: T): T => {
  // JSON.stringify может работать медленно при очень больших объемах данных.
  const storedHash = React.useRef(JSON.stringify(value));
  const [storedValue, setStoredValue] = React.useState<T>(value);
  React.useEffect(() => {
    const valueHash = JSON.stringify(value);
    if (storedHash.current !== valueHash) {
      setStoredValue(value);
      storedHash.current = valueHash;
    }
  }, [value]);
  return storedValue;
};

export default useStoredValue;
