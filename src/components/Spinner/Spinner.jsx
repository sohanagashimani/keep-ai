import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Spinner = ({
  spinning,
  size = 40,
  color,
  className = "flex items-center justify-center",
}) => {
  return (
    <div className={className}>
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: size,
              color,
            }}
            spin
          />
        }
        spinning={spinning}
      />
    </div>
  );
};

export default Spinner;
