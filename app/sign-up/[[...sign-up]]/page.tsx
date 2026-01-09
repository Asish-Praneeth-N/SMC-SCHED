import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <SignUp
                appearance={{ baseTheme: dark }}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                forceRedirectUrl="/dashboard"
            />
        </div>
    );
}

