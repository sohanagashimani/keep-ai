import React, { useState } from "react";
import NavBarSpinner from "./NavBarSpinner/NavBarSpinner";
import FilterNotes from "../FilterNotes/FilterNotes";
import NavBrand from "./NavBrand/NavBrand";
import NavSearchBar from "./NavSearchBar/NavSearchBar";
import NavUserIconAndLogoutModal from "./NavUserIconAndLogoutModal/NavUserIconAndLogoutModal";

const Header = ({
  setSearchTerm,
  searchTerm,
  setSortBy,
  sortBy,
  navBarLoader,
  handleLogout,
  handleRefresh,
  user,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const hideLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  return (
    <div className="flex justify-between items-center w-full">
      <NavBrand />
      <NavSearchBar
        {...{
          searchTerm,
          setSearchTerm,
          isSearchFocused,
          handleSearchFocus,
          handleSearchBlur,
        }}
      />
      <div className="flex">
        <div className="hidden md:flex">
          <FilterNotes
            {...{
              setSortBy,
              sortBy,
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <NavBarSpinner loading={navBarLoader} handleRefresh={handleRefresh} />
          <NavUserIconAndLogoutModal
            {...{
              user,
              logoutModalVisible,
              handleLogout,
              hideLogoutModal,
              showLogoutModal,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
