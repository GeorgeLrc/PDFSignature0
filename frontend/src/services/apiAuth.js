import api from '@/utils/api';

export const logInUser = async ({ email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
};