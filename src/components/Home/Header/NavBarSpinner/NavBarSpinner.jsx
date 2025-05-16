import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import Spinner from "../../../Spinner/Spinner";

const NavBarSpinner = ({ loading, handleRefresh }) => {
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
    <div className="w-6 mx-2 flex items-center justify-center">
      {loading ? (
        <Spinner size={20} color={"white"} />
      ) : showCheckmark ? (
        <FiCheckCircle size={20} className="text-green-400" />
      ) : (
        <FiRefreshCw
          onClick={handleRefresh}
          size={20}
          className="cursor-pointer text-gray-300 hover:text-gray-100 transition-colors duration-150"
          title="Refresh"
        />
      )}
    </div>
  );
};

export default NavBarSpinner;
