import { io } from "socket.io-client";

const WS_SERVER_URL = process.env.REACT_APP_WS_SERVER_URL ?? "https://leweso-backend.onrender.com";

export const socket = io(WS_SERVER_URL);
