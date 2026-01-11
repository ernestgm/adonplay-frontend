import React, {useEffect, useState} from "react";

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
    setOnlineDevice(devices.includes(deviceId));
  }, [devices, deviceId]);

  return (
    <span className={`block w-5 h-5 ${ onlineDevice ? "onlineBadget text-emerald-500" : "text-error-700" }`}>
        { icon }
    </span>
  );
};

export default OnlineBadge;
