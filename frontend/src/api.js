const API_BASE_URL = 'http://localhost:8000';

export const processFile = async (file, password, mode) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/${mode}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return await response.blob();
};