
import MainLayout from "@/components/layout/MainLayout";
import AccountSettings from "@/components/settings/AccountSettings";

const Settings = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <AccountSettings />
      </div>
    </MainLayout>
  );
};

export default Settings;
