import SignInForm from "@/components/auth/SignInForm";
import {generatePageMetadata} from "@/i18n/metadata";

export async function generateMetadata() {
    return generatePageMetadata("pages.signIn");
}

export default function SignIn() {
  return <SignInForm />;
}
