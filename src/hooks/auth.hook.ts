import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getMe,
  googleOAuth,
  userForgotPassword,
  userLogin,
  userLogout,
  userRegistration,
  userResetPassword,
  verifyAccount,
} from "../api";

export function useLogin() {
  return useMutation({
    mutationFn: userLogin,
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: verifyAccount,
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: userLogout,
  });
}

export function useGoogleOAuth() {
  return useMutation({
    mutationFn: googleOAuth,
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: userForgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: userResetPassword,
  });
}
