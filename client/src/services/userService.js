import axios from "axios";

export default {
    readCookie: async () => {
        const res = await axios.get("/api/auth/fetch", {withCredentials: true});
        return res.data || [];
    },

    deleteCookie: async () => {
        const res = await axios.get("/api/auth/end", {withCredentials: true});
        return res.data || [];
    },

    getOne: async (id) => {
        const res = await axios.get("/api/user", { params: {
            id: id
        }, withCredentials: true});
        return res.data || [];
    }
}