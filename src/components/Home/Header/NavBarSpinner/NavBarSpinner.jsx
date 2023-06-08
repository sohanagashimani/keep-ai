import React, { useEffect, useState } from "react";
import { BsCloudCheck } from "react-icons/bs";
import { IoRefreshOutline } from "react-icons/io5";
import Spinner from "../../../Spinner/Spinner";

const NavBarSpinner = ({ loading, handleRefresh }) => {
  console.log("NavBarSpinner.jsx:");
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowCheckmark(true);

      const timer = setTimeout(() => {
        setShowCheckmark(false);
      }, 2250);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading]);

  return (
    <div className=" w-6 mx-2 ">
      {loading ? (
        <Spinner size={20} color={"white"} />
      ) : (
        <>
          {showCheckmark ? (
            <BsCloudCheck />
          ) : (
            <IoRefreshOutline
              onClick={handleRefresh}
              className="cursor-pointer"
            />
          )}
        </>
      )}
    </div>
  );
};

export default NavBarSpinner;
