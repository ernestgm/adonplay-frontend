import React from "react";
import UserForm from "@/components/app/user/form/UserForm";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: `Create Users | ${process.env.NAME_PAGE}`,
    description: `This is Create Users Page in ${process.env.NAME_PAGE}`,
};
const CreateUserPage = () => {
  return (
    <div className="py-8">
      <UserForm />
    </div>
  );
};

export default CreateUserPage;
