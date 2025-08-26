import React, {useEffect, useState} from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  devices?: string[];
  deviceId?: string;
}

const OnlineBadge: React.FC<BadgeProps> = ({
  devices = [],
  deviceId = "",
}) => {
  const [onlineDevice, setOnlineDevice] = useState(false);

  useEffect(() => {
    console.log(devices);
    console.log(deviceId);
    setOnlineDevice(devices.includes(deviceId));
  }, [devices]);

  return (
    <span className={`block w-5 h-5 rounded-4xl ${ onlineDevice ? "bg-emerald-900" : "bg-error-800" }`}></span>
  );
};

export default OnlineBadge;
