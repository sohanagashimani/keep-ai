"use client";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientToastContainer() {
  return <ToastContainer transition={Zoom} />;
}
