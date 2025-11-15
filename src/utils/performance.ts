export const measurePerformance = (componentName: string) => {
  if (process.env.NODE_ENV === 'development' && typeof performance !== 'undefined') {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
    };
  }
  return () => {};
};
