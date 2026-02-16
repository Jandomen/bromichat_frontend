import api from "./api";

export const uploadProduct = async (productData, token) => {
  const res = await api.post("/api/products", productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const uploadProductImage = async (imageFile, token) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await api.post("/api/products/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getUserProducts = async (userId, token) => {
  const res = await api.get(`/api/products/user/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const searchProducts = async (query, category = "Todas") => {
  const catParam = category && category !== "Todas" ? `&category=${encodeURIComponent(category)}` : "";
  const res = await api.get(`/api/products/search?query=${encodeURIComponent(query)}${catParam}`);
  return res.data;
};

export const getRandomProducts = async (page = 1, token, category = "Todas") => {
  const catParam = category && category !== "Todas" ? `&category=${encodeURIComponent(category)}` : "";
  const res = await api.get(`/api/products/feed?page=${page}${catParam}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const updateProduct = async (id, productData, token) => {
  const res = await api.put(`/api/products/${id}`, productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteProduct = async (id, token) => {
  const res = await api.delete(`/api/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
