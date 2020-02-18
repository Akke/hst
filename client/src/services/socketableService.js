import axios from "axios";

export default {
    getAll: async () => {
        const res = await axios.get("/api/socketable");
        return res.data || [];
    },

    getTypes: async () => {
        const res = await axios.get("/api/socketable/type");
        return res.data || [];
    },
}