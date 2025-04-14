
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Camera, LogIn } from "lucide-react";

const Auth = () => {
  const { signInWithGoogle, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-slate-200 rounded-t-lg py-6">
            <div className="flex justify-center mb-4">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Photo HQ</CardTitle>
            <CardDescription>Sign in to access the assignment tracker</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col space-y-4">
              <Button
                onClick={signInWithGoogle}
                className="flex items-center justify-center gap-2 w-full"
                disabled={isLoading}
              >
                <LogIn className="h-5 w-5" />
                Sign in with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
