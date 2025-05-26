import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import NavBarSpinner from "./NavBarSpinner/NavBarSpinner";
import FilterNotes from "../FilterNotes/FilterNotes";
import NavBrand from "./NavBrand/NavBrand";
import NavSearchBar from "./NavSearchBar/NavSearchBar";
import NavUserIconAndLogoutModal from "./NavUserIconAndLogoutModal/NavUserIconAndLogoutModal";
import { FiMessageCircle } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";

const Header = ({
  setSearchTerm,
  searchTerm,
  setSortBy,
  sortBy,
  navBarLoader,
  handleLogout,
  handleRefresh,
  user,
  chatDrawerVisible,
  setChatDrawerVisible,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const router = useRouter();

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

  const handleChatClick = () => {
    if (isMobile) {
      router.push("/chat");
    } else {
      if (chatDrawerVisible) {
        setChatDrawerVisible(false);
      } else {
        setChatDrawerVisible(true);
      }
    }
  };

  return (
    <div className="flex justify-between items-center w-full border-b border-neutral-800 shadow-sm  md:px-4 py-2 sticky top-0 z-20 gap-2">
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
      <div className="flex items-center gap-4">
        <div className="hidden md:flex">
          <FilterNotes
            {...{
              setSortBy,
              sortBy,
            }}
          />
        </div>
        <Tooltip title="AI Assistant" color="#525252" arrow={false}>
          <Button
            type="text"
            icon={<FiMessageCircle size={22} className="text-gray-200" />}
            onClick={handleChatClick}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full px-0 md:px-3 py-1 pl-2 sm:py-1 font-medium text-gray-200 transition-all duration-200 min-w-[36px] min-h-[36px] justify-center"
          >
            {/* <span className="hidden md:flex text-gray-200 text-sm sm:text-base">
            AI Assistant
          </span> */}
          </Button>
        </Tooltip>
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
  );
};

export default Header;
