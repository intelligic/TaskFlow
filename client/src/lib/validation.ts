export const validateEmail = (email: string) => {
  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateName = (value: string) => {
  const regex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  return regex.test(value.trim());
};

export const validateWorkspaceName = (value: string) => {
  const regex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  return regex.test(value.trim());
};

export const validatePassword = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/;
  return regex.test(password);
};
