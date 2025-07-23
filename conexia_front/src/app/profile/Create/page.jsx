import CreateProfileForm from "@/components/profile/createProfile/createProfileForm";
import { Footer } from "@/components/Footer";
import HeroPanel from "@/components/common/HeroPanel";

export default function CreateProfilePage() {
  return (
    <main className="min-h-screen flex flex-col bg-conexia-soft">
      <div className="flex-grow flex flex-col items-center justify-center px-4 ">
        <CreateProfileForm />
      </div>
      <Footer />
    </main>
  );
}
