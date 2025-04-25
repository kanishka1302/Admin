export const safeLocalStorage = {
    get: (key) => {
      if (typeof window !== "undefined") {
        try {
          return JSON.parse(localStorage.getItem(key));
        } catch (err) {
          console.warn(`Failed to parse localStorage item "${key}":`, err);
          return null;
        }
      }
      return null;
    },
    set: (key, value) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
          console.warn(`Failed to set localStorage item "${key}":`, err);
        }
      }
    },
  };
  
