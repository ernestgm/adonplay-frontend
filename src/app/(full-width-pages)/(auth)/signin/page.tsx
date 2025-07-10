import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `SignIn Page | ${process.env.NAME_PAGE}`,
  description: "This is Signin Page in AdOnPLay",
};

export default function SignIn() {
  return <SignInForm />;
}
