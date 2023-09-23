import Bonus from "@/components/modules/Bonus";
import Grant from "@/components/modules/Grant";
import Milestone from "@/components/modules/Milestones";

export default function Home() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <Grant />
      </div>
      <div className="relative w-full h-full flex items-center justify-center">
        <Milestone />
      </div>
      <div className="relative w-full h-full flex items-center justify-center">
        <Bonus />
      </div>
    </div>
  );
}
