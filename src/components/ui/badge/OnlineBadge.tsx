import React, {useEffect, useState} from "react";

// type BadgeVariant = "light" | "solid";
// type BadgeSize = "sm" | "md";
// type BadgeColor =
//   | "primary"
//   | "success"
//   | "error"
//   | "warning"
//   | "info"
//   | "light"
//   | "dark";

interface BadgeProps {
    icon?: React.ReactNode;
  devices?: string[];
  deviceId?: any;
}

const OnlineBadge: React.FC<BadgeProps> = ({
    icon,
  devices = [],
  deviceId = "",
}) => {
  const [onlineDevice, setOnlineDevice] = useState(false);

  useEffect(() => {
    console.log(devices);
    console.log(deviceId);
    setOnlineDevice(devices.includes(deviceId));
  }, [devices, deviceId]);

  return (
    <span className={`block w-5 h-5 ${ onlineDevice ? "text-emerald-500" : "text-error-700" }`}>
        { icon }
    </span>
  );
};

export default OnlineBadge;
