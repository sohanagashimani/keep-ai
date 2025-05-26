import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import Spinner from "../../../Spinner/Spinner";
import { LoadingOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

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
        <Spinner
          size={20}
          indicator={<LoadingOutlined style={{ color: "white" }} spin />}
        />
      ) : showCheckmark ? (
        <FiCheckCircle size={20} className="text-green-400" />
      ) : (
        <Tooltip title="Refresh" color="#525252" arrow={false}>
          <FiRefreshCw
            onClick={handleRefresh}
            size={20}
            className="cursor-pointer text-gray-300 hover:text-gray-100 transition-colors duration-150"
          />
        </Tooltip>
      )}
    </div>
  );
};

export default NavBarSpinner;
