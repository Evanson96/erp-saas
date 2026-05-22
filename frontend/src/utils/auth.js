export const saveAuth = ({ token, user }) => {
  localStorage.setItem("erp_token", token);
  localStorage.setItem("erp_user", JSON.stringify(user));
};

export const getToken = () => {
  return localStorage.getItem("erp_token");
};

export const getUser = () => {
  const user = localStorage.getItem("erp_user");
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem("erp_token");
  localStorage.removeItem("erp_user");
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const saveCustomerAuth = ({ token, account, company }) => {
  localStorage.setItem("erp_customer_token", token);
  localStorage.setItem("erp_customer_account", JSON.stringify(account));
  localStorage.setItem("erp_customer_company", JSON.stringify(company));
};

export const getCustomerToken = () => {
  return localStorage.getItem("erp_customer_token");
};

export const getCustomerAccount = () => {
  const account = localStorage.getItem("erp_customer_account");
  return account ? JSON.parse(account) : null;
};

export const getCustomerCompany = () => {
  const company = localStorage.getItem("erp_customer_company");
  return company ? JSON.parse(company) : null;
};

export const clearCustomerAuth = () => {
  localStorage.removeItem("erp_customer_token");
  localStorage.removeItem("erp_customer_account");
  localStorage.removeItem("erp_customer_company");
};

export const isCustomerAuthenticated = () => {
  return Boolean(getCustomerToken());
};
