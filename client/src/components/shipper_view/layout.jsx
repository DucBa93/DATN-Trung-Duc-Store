import { Outlet } from "react-router-dom";
import ShipperSideBar from "./sidebar";
import ShipperHeader from "./header";
import { useState } from "react";

function ShipperLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-screen pr-6 ">
      <div >
        <ShipperSideBar open={openSidebar} setOpen={setOpenSidebar} />
      </div>
      <div className="flex flex-col flex-1 w-full">
        <ShipperHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ShipperLayout;