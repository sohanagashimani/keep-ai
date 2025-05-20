"use client";

import React from "react";
import { Spin } from "antd";

const Spinner = ({
  spinning,
  size = 40,
  className = "flex items-center justify-center",
  indicator,
}) => {
  return (
    <div className={className}>
      <Spin
        indicator={indicator}
        size={size}
        spinning={spinning}
      />
    </div>
  );
};

export default Spinner;
