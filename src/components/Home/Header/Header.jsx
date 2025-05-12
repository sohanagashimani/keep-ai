import React, { useState } from "react";
import { Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import NavBarSpinner from "./NavBarSpinner/NavBarSpinner";
import FilterNotes from "../FilterNotes/FilterNotes";
import NavBrand from "./NavBrand/NavBrand";
import NavSearchBar from "./NavSearchBar/NavSearchBar";
import NavUserIconAndLogoutModal from "./NavUserIconAndLogoutModal/NavUserIconAndLogoutModal";
import ChatDrawer from "../../Chat/ChatDrawer";

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
  const [chatDrawerVisible, setChatDrawerVisible] = useState(false);

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
    <>
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
            <Button
              type="text"
              icon={<MessageOutlined />}
              onClick={() => setChatDrawerVisible(true)}
              className="text-gray-200 hover:text-white"
            />
            <NavBarSpinner
              loading={navBarLoader}
              handleRefresh={handleRefresh}
            />
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
      <ChatDrawer
        visible={chatDrawerVisible}
        onClose={() => setChatDrawerVisible(false)}
        handleRefresh={handleRefresh}
      />
    </>
  );
};

export default Header;
