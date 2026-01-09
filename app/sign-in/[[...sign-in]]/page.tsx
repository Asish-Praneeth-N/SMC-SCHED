import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <SignIn
                appearance={{ baseTheme: dark }}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl="/dashboard"
            />
        </div>
    );
}

