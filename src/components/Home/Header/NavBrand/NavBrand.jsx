import React from "react";

const NavBrand = () => {
  return (
    <div className="xl:flex items-center mr-6 hidden">
      <div className="mr-2 ">
        <img
          src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png"
          srcSet="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png 1x, https://www.gstatic.com/images/branding/product/2x/keep_2020q4_48dp.png 2x "
          alt=""
          aria-hidden="true"
          role="presentation"
          className="w-10 h-11"
        />
      </div>
      <div className="text-2xl underline">Keep</div>
    </div>
  );
};

export default NavBrand;
