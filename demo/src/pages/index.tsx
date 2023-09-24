import useLens from "@/components/hooks/useLens";
import Bonus from "@/components/modules/Bonus";
import Grant from "@/components/modules/Grant";
import Header from "@/components/modules/Header";
import Milestone from "@/components/modules/Milestones";
import Social from "@/components/modules/Social";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function Home() {
  const {
    handlePost,
    claimBonus,
    claimMilestone,
    setCoverImageValue,
    setPostDescription,
    signIn,
    postLoading,
    postDescription,
    profile,
    coverImageValue,
    publication,
    handleCollect,
    collected,
    filledBars,
    setFilledBars,
    reacted,
    currentMilestone,
    handleMirrorLike,
    claimLoading,
  } = useLens();
  console.log({ publication });
  const { openConnectModal } = useConnectModal();
  return (
    <div className="relative w-full h-fit flex flex-col items-start justify-center">
      <Header
        profile={profile}
        signIn={signIn}
        openConnectModal={openConnectModal}
      />
      <div className="relative flex flex-row items-start justify-center w-full h-full gap-3 p-5">
        <Grant
          postDescription={postDescription}
          setPostDescription={setPostDescription}
          setCoverImageValue={setCoverImageValue}
          coverImageValue={coverImageValue}
          publication={publication}
          reacted={reacted}
          collected={collected}
        />
        <div className="relative flex flex-col gap-3 items-center justify-center w-full h-full">
          <div className="relative w-fit h-full flex flex-row gap-10">
            <Milestone
              reacted={reacted}
              handlePost={handlePost}
              postLoading={postLoading}
              claimMilestone={claimMilestone}
              postDescription={postDescription}
              setPostDescription={setPostDescription}
              publication={publication}
              handleCollect={handleCollect}
              collected={collected}
              filledBars={filledBars}
              currentMilestone={currentMilestone}
              setFilledBars={setFilledBars}
              claimLoading={claimLoading}
              handleMirrorLike={handleMirrorLike}
            />
            <Bonus
              claimBonus={claimBonus}
              collected={collected}
              filledBars={filledBars}
              setFilledBars={setFilledBars}
            />
          </div>
        </div>
      </div>
      <Social />
    </div>
  );
}
