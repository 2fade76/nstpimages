import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  return <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Settings
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <Card className="bg-slate-300">
            <CardHeader className="bg-slate-400">
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <Label>Email Address</Label>
                <p className="text-sm font-medium">photoadmin@gmail.com</p>
              </div>
              
              <div className="space-y-1">
                <Label>Account Type</Label>
                <p className="text-sm font-medium">Administrator</p>
              </div>
              
              <div className="space-y-1">
                <Label>Account Created</Label>
                <p className="text-sm font-medium">January 1, 2024</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>;
};
export default Settings;