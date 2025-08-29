import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api", // your backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
