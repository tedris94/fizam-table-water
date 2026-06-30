import Link from 'next/link';
import { DashboardLayout } from './DashboardLayout';
import { Settings as SettingsIcon, User, Lock, Bell, Shield } from 'lucide-react';
import { LoginDemoToggle } from './LoginDemoToggle';
import { BackupDatabaseButton } from './BackupDatabaseButton';

interface SettingsViewProps {
  role: string;
}

export function SettingsView({ role }: SettingsViewProps) {
  return (
    <DashboardLayout title="Settings" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">Account Settings</h2>
          <p className="text-gray-600">Manage your account preferences and security</p>
        </div>

        {/* Settings Sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-[#2563eb]" />
              </div>
              <h3 className="text-xl text-[#1a1f71]">Profile Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="+234 xxx xxxx xxx"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white py-3 rounded-xl hover:shadow-lg transition-all">
                Save Changes
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl text-[#1a1f71]">Security</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:shadow-lg transition-all">
                Update Password
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl text-[#1a1f71]">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-[#1a1f71] mb-1">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive email updates</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-[#1a1f71] mb-1">Order Updates</div>
                  <div className="text-sm text-gray-600">Get notified about orders</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-[#1a1f71] mb-1">Application Updates</div>
                  <div className="text-sm text-gray-600">New job applications</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Login Page Settings (Super Admin Only) */}
          {role === 'super_admin' && <LoginDemoToggle />}

          {/* System Settings (Super Admin Only) */}
          {role === 'super_admin' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl text-[#1a1f71]">System Administration</h3>
              </div>
              <div className="space-y-3">
                <BackupDatabaseButton />
                <Link
                  href="/dashboard/audit"
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-[#1a1f71]">Audit Logs</span>
                  </div>
                  <span className="text-sm text-gray-500">→</span>
                </Link>
                <Link
                  href="/dashboard/roles"
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-[#1a1f71]">User Permissions</span>
                  </div>
                  <span className="text-sm text-gray-500">→</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
