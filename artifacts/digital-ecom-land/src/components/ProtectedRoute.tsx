import * as React from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useGetProfile } from "@workspace/api-client-react";
import { useAuth } from "./AuthProvider";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    if (!loading && !session) navigate("/auth", { replace: true });
  }, [loading, navigate, session]);

  if (loading || !session) return <LoadingScreen />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [, navigate] = useLocation();
  const profile = useGetProfile();

  React.useEffect(() => {
    if (!loading && !session) navigate("/auth", { replace: true });
    if (session && !profile.isLoading && profile.data?.role !== "admin") navigate("/dashboard", { replace: true });
  }, [loading, navigate, profile.data?.role, profile.isLoading, session]);

  if (loading || !session || profile.isLoading) return <LoadingScreen />;
  if (profile.data?.role !== "admin") return null;
  return <>{children}</>;
}