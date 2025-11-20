import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SiNike, SiPuma, SiNewbalance, SiMlb } from "react-icons/si";
import { CgAdidas } from "react-icons/cg";

const Layout = () => {
  return (
    <div className="flex min-h-screen min-w-screen">
      <div className="hidden lg:flex items-center justify-center bg-black flex-1 px-12">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
          <div className='flex justify-center gap-2.5 text-3xl'>
            <SiNike/>
            <CgAdidas/>
            <SiPuma/>
            <SiNewbalance/>
            <SiMlb/>
          </div>
          <h1 className="text-2xl font-extrabold ">
           Chào mừng bạn đến với Trung Duc Authentic 
          </h1>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout 
