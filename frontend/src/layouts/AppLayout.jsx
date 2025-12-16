import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div>{children}</div>
    </div>
  );
}
