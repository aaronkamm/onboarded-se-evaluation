const BASE_URL = 'https://app.onboarded.com/api/v1';

const getHeaders = ({ json = false } = {}) => {
  const headers = {
    Authorization: `Bearer ${process.env.ONBOARDED_TOKEN}`
  };

  if (json) headers['Content-Type'] = 'application/json';

  return headers;
};

export const getEmployee = async (employeeId) => {
  if (!employeeId) throw new Error('employeeId is required');

  const res = await fetch(`${BASE_URL}/employees/${employeeId}`, {
    headers: getHeaders()
  });

  if (!res.ok) {
    throw new Error(
      `Onboarded GET /employees/${employeeId} failed: ${res.status}`
    );
  }

  return res.json();
};

export const getEmployer = async (employerId) => {
  if (!employerId) throw new Error('employerId is required');

  const res = await fetch(`${BASE_URL}/employers/${employerId}`, {
    headers: getHeaders()
  });

  if (!res.ok) {
    throw new Error(
      `Onboarded GET /employers/${employerId} failed: ${res.status}`
    );
  }

  return res.json();
};
