import React from "react";
import { SearchOutlined } from "@ant-design/icons";

const NavSearchBar = ({
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  handleSearchFocus,
  handleSearchBlur,
}) => {
  return (
    <div
      className={`flex items-center ${
        isSearchFocused ? "bg-white" : "bg-neutral-600"
      } rounded-lg transition-all duration-500  p-2 py-2 lg:py-3 xl:w-[44rem] lg:w-[35rem] md:w-[25rem] xl:mr-48`}
    >
      <SearchOutlined className="text-gray-500 mx-2" />
      <input
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`bg-transparent w-full border-none outline-none placeholder:text-neutral-100  text-black  ${
          isSearchFocused ? "placeholder:text-gray-500" : ""
        }`}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
    </div>
  );
};

export default NavSearchBar;
