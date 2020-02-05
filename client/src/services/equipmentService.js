import axios from "axios";

export default {
	getAll: async () => {
		const res = await axios.get("/api/equipment");
		return res.data || [];
	},

	getOne: async (item) => {
		const res = await axios.get("/api/equipment?item=" + item);
		return res.data || [];
	},

	getTypes: async () => {
		const res = await axios.get("/api/equipment/type");
		return res.data || [];
	},
}