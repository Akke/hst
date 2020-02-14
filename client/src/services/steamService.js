import axios from "axios";

export default {
    getPlayerSummaries: async (steamids) => {
        const res = await axios.get("/api/steam/getPlayerSummaries", {
            params: {
                steamids: steamids
            }
        });
        
        return res.data || [];
    }
}