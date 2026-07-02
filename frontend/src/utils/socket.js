import { io } from "socket.io-client";
import { getUser } from "./auth";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://farmfriend-s1-vjn8.onrender.com";
const socket = io(SOCKET_URL, { autoConnect: false });

export function connectSocket() {
  const user = getUser();
  socket.connect();
  if (user && user._id) {
    socket.emit("register", user._id);
  }
  return socket;
}

export default socket;
