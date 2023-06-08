import { Select } from "antd";
import React from "react";

const FilterNotes = ({ sortBy, setSortBy }) => {
  const { Option } = Select;
  return (
    <div className="bg-neutral-700 p-1 rounded-md pl-2 w-40 mx-3 flex gap-1">
      <span className="text-sm -mr-2 py-1">Sort by : </span>
      <Select
        placeholder="Sort By"
        value={sortBy}
        onChange={(value) => setSortBy(value)}
        style={{ color: "white" }}
        className="w-24 -mr-2"
        bordered={false}
        showArrow={false}
      >
        <Option value="">None</Option>
        <Option value="title">Title</Option>
        <Option value="completed">Completed</Option>
      </Select>
    </div>
  );
};

export default FilterNotes;
