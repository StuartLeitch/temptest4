export const getOsEnv = (osEnv: string, defaultValue?: string) => {
  const value = process.env[osEnv];
  if (defaultValue !== undefined) {
    return value || defaultValue;
  }

  if (!value) {
    throw new Error(`Variable ${osEnv} not found`);
  }

  return value;
};
