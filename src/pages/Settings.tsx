
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, User } from "lucide-react";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const { user, profile, roles, signOut, isAdmin, updateUserRole } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const handleRoleChange = async (role: "admin" | "editor" | "user") => {
    if (!user) return;
    
    try {
      await updateUserRole(user.id, role);
      toast.success(`${role} role updated successfully`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  return <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Settings
          </h1>
        </div>

        <Tabs defaultValue="application" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            {isAdmin && <TabsTrigger value="permissions">Permissions</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="application">
            <Card className="bg-slate-300">
              <CardHeader className="bg-slate-400">
                <CardTitle>Application Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 bg-slate-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notifications">Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about assignment updates
                    </p>
                  </div>
                  <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch id="darkMode" checked={darkModeEnabled} onCheckedChange={setDarkModeEnabled} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="autoSave">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save changes to assignments
                    </p>
                  </div>
                  <Switch id="autoSave" checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="bg-slate-300">
              <CardHeader className="bg-slate-400">
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.display_name || user.email || ""} />
                      <AvatarFallback>{getInitials(profile?.display_name || user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile?.display_name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label>User Roles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {roles.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button variant="destructive" onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="permissions">
              <Card className="bg-slate-300">
                <CardHeader className="bg-slate-400">
                  <CardTitle>Role Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Assign Roles to Your Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Use this section to test different role permissions for your account
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-500" />
                            Admin
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">Full access to manage all aspects of the system</p>
                          <Button 
                            onClick={() => handleRoleChange("admin")}
                            variant="outline" 
                            className="w-full"
                            disabled={roles.includes("admin")}
                          >
                            {roles.includes("admin") ? "Current Role" : "Assign Role"}
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            Editor
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">Can create and edit assignments but not manage users</p>
                          <Button 
                            onClick={() => handleRoleChange("editor")}
                            variant="outline" 
                            className="w-full"
                            disabled={roles.includes("editor")}
                          >
                            {roles.includes("editor") ? "Current Role" : "Assign Role"}
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-green-500" />
                            User
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">Can view assignments and update status only</p>
                          <Button 
                            onClick={() => handleRoleChange("user")}
                            variant="outline" 
                            className="w-full"
                            disabled={roles.includes("user")}
                          >
                            {roles.includes("user") ? "Current Role" : "Assign Role"}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>;
};

export default Settings;
