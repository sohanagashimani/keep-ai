import { Avatar, Button, Modal, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";

import React from "react";
import { useMediaQuery } from "react-responsive";

const NavUserIconAndLogoutModal = ({
  user,
  logoutModalVisible,
  handleLogout,
  hideLogoutModal,
  showLogoutModal,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 820 });
  return (
    <div>
      <Modal
        open={logoutModalVisible}
        onCancel={hideLogoutModal}
        width={200}
        className="left-[22%] top-[9%] md:left-[36%] lg:left-[41%] lg:top-[10%] text-gray-200"
        closable={false}
        footer={[
          <Button
            key="cancel"
            onClick={hideLogoutModal}
            type="text"
            className="text-gray-200 bg-neutral-700 w-full mb-2 border-none "
          >
            Cancel
          </Button>,
          <Button
            key="logout"
            type="text"
            className="text-red-500 bg-neutral-700 w-full border-none "
            onClick={handleLogout}
          >
            Logout
          </Button>,
        ]}
      >
        <div className="flex gap-3 items-center pb-2">
          <Avatar
            src={user.avatar_url}
            alt="user_icon"
            icon={<UserOutlined />}
            size="large"
          />
          <Tooltip
            title={`${user.name ?? ""} ${user.email}`}
            color="#525252"
            arrow={false}
            placement="topLeft"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            className="cursor-default"
            trigger={isMobile ? "click" : "hover"}
            autoAdjustOverflow={true}
          >
            <p className="truncate-name">{user?.name}</p>
            <p className="truncate-name">{user?.email}</p>
          </Tooltip>
        </div>
      </Modal>
      <Tooltip
        title={`${user.name ?? ""} ${user.email}`}
        color="#525252"
        arrow={false}
        placement="bottomLeft"
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        mouseEnterDelay={0.3}
        className="cursor-pointer"
        autoAdjustOverflow={true}
        open={isMobile ? false : null}
      >
        <Avatar
          src={user.avatar_url}
          alt="user_icon"
          icon={<UserOutlined />}
          size="large"
          onClick={showLogoutModal}
        />
      </Tooltip>
    </div>
  );
};

export default NavUserIconAndLogoutModal;
