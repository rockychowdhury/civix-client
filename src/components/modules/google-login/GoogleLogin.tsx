"use client";

import { toast } from "sonner";
import { useGoogleOAuth } from "@/hooks/auth.hook";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function GoogleLoginComponent() {
  const router = useRouter();
  const { mutate: googleLogin } = useGoogleOAuth();

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.error("Google OAuth Failed", {
        description: "Something went wrong. Please try again",
      });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: () => {
          toast.success("Logged in Successfully", {
            description: "Welcome back",
          });
          router.push("/");
        },
        onError: (err) => {
          toast.error("Google OAuth Failed", {
            description: err.message || "Something went wrong. Please try again",
          });
        },
      },
    );
  };

  const handleGoogleError = () => {
    toast.error("Google OAuth Failed", {
      description: "Something went wrong. Please try again",
    });
  };

  return (
    <GoogleLogin
      theme="outline"
      shape="pill"
      text="continue_with"
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
    />
  );
}