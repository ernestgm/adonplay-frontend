"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Switch from "../switch/Switch";

export default function ToggleSwitch() {
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  return (
    <ComponentCard title="Toggle switch input">
      <div className="flex gap-4">
        <Switch
            label="Default"
            defaultChecked={true}
            onChange={handleSwitchChange} id={0}        />
        <Switch
            label="Checked"
            defaultChecked={true}
            onChange={handleSwitchChange} id={0}        />
        <Switch label="Disabled" disabled={true} id={0} />
      </div>{" "}
      <div className="flex gap-4">
        <Switch
            label="Default"
            defaultChecked={true}
            onChange={handleSwitchChange}
            color="gray" id={0}        />
        <Switch
            label="Checked"
            defaultChecked={true}
            onChange={handleSwitchChange}
            color="gray" id={0}        />
        <Switch label="Disabled" disabled={true} color="gray" id={0} />
      </div>
    </ComponentCard>
  );
}
