import axios from "axios";
import { filter } from "../context/filter";

export default {
    getAll: async (skip = 0, limit = 10, mode = filter.mode, region = filter.region, minPrice = filter.minPrice, maxPrice = filter.maxPrice, sort = "desc", item = null) => {
        const res = await axios.get("/api/offer", {
            params: {
                skip: skip,
                limit: limit,
                mode: mode,
                region: region,
                minPrice: minPrice,
                maxPrice: maxPrice,
                sort: sort,
                item: item
            }
        });

        return res.data || [];
    },

    getChartMonth: async (item) => {
        const res = await axios.get("/api/offer", {
            params: {
                skip: 0,
                limit: 0,
                item: item,
                range: "month"
            }
        })

        return res.data || [];
    },

    insertOne: async (data) => {
        const res = await axios.post("/api/offer", data)
            .then((response) => {
                return response;
            })
            .catch((err) => {
                return err.response;
            });

        return res;
    }
}

