import toast from "react-hot-toast"
import api from "@/utils/api"

export const getUserLists = async (accessToken) => {
    try {
        const { data } = await api.post('/api/admin/users-list', {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        console.log(data.users)
        return data.users
    }
    catch (err) {
        toast.err(err.message)
        console.error(err.message)
    }
}

export const toggleUserStatus = async ({ accessToken, userId }) => {
    try {
        let { data } = await api.post('/api/admin/toggle-restricted', { userId }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        return data.message
    }
    catch (err) {
        toast.err(err.message)
        console.error(err.message)
    }
}

export const deleteUser = async ({ accessToken, userId }) => {
    try {
        let { data } = await api.post(`/api/admin/delete-user/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data.message
    } catch (err) {
        toast.err(err.message)
        console.error("Delete user failed:", err);
    }
}

export const createNewUser = async (newUser) => {
    try {
        const { data } = await api.post('/api/admin/add-user', newUser, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data.user;
    } catch (err) {
        console.error("Error creating user:", err);
        throw err;
    }
}

export const editUser = async ({ accessToken, userId, userData }) => {
    try {
        console.log("📤 Sending edit user request for userId:", userId);
        console.log("Form data keys:", Array.from(userData.keys()));
        
        const { data } = await api.post(`/api/admin/update-user/${userId}`, userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${accessToken}`,
            },
        })

        console.log("✅ Edit user response:", data);
        return data.user

    } catch (err) {
        console.error("❌ Error updating user:", err);
        console.error("Error response data:", err.response?.data);
        console.error("Error message:", err.message);
        
        const errorMessage = err.response?.data?.message || 'Something went wrong';
        toast.error(errorMessage)
        throw err; // Re-throw so useMutation can handle it
    }
}