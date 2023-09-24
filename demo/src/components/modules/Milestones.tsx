import { FunctionComponent, useEffect } from "react";
import { MilestoneProps } from "../types/cypher.types";
import { AiOutlineLoading } from "react-icons/ai";

const Milestone: FunctionComponent<MilestoneProps> = ({
  setPostDescription,
  postDescription,
  claimMilestone,
  postLoading,
  handlePost,
  publication,
  handleCollect,
  collected,
  filledBars,
  setFilledBars,
  currentMilestone,
  claimLoading,
  handleMirrorLike,
  reacted,
}): JSX.Element => {
  useEffect(() => {
    if (collected && filledBars < 20) {
      const timer = setInterval(() => {
        setFilledBars(((prev: any) => prev + 1) as any);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [collected, filledBars]);

  return (
    <div className="relative flex flex-row items-center justify-center gap-10 w-fit h-full">
      <div className="relative w-72 h-full flex flex-col items-center justify-center gap-4 font-on text-white">
        <div className="relative w-full h-full rounded-lg border border-plat flex flex-col items-start justify-center p-2">
          <div className="relative w-full h-fit flex flex-row items-center justify-center">
            <div className="relative w-full h-fit flex items-center justify-start font-on text-2xl uppercase">
              Milestone 3
            </div>
            <input
              className="text-white font-dogB flex items-center justify-center bg-black text-xs w-20 h-fit flex"
              defaultValue="$5000"
              disabled
            />
          </div>
          <div className="relative w-full h-fit flex flex-col font-dog text-xxs gap-1.5 text-white">
            <div className="flex relative w-fit h-fit justify-center items-start">
              <input
                value={postDescription.milestoneThree[0]}
                onChange={(e) => {
                  const updatedMilestoneThree = [
                    ...postDescription.milestoneThree,
                  ];
                  updatedMilestoneThree[0] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: postDescription.milestoneOne,
                    milestoneTwo: postDescription.milestoneTwo,
                    milestoneThree: updatedMilestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
            <div className="flex relative w-fit h-fit justify-center items-start">
              <input
                value={postDescription.milestoneThree[1]}
                onChange={(e) => {
                  const updatedMilestoneThree = [
                    ...postDescription.milestoneThree,
                  ];
                  updatedMilestoneThree[1] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: postDescription.milestoneOne,
                    milestoneTwo: postDescription.milestoneTwo,
                    milestoneThree: updatedMilestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
            <div className="flex relative w-fit h-fit justify-center items-start">
              <input
                value={postDescription.milestoneThree[2]}
                onChange={(e) => {
                  const updatedMilestoneThree = [
                    ...postDescription.milestoneThree,
                  ];
                  updatedMilestoneThree[2] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: postDescription.milestoneOne,
                    milestoneTwo: postDescription.milestoneTwo,
                    milestoneThree: updatedMilestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
          </div>
          <div className="relative w-full h-fit flex flex-row items-center justify-center gap-3">
            <div className="relative w-full h-14 flex items-start justify-center flex-col">
              <div className="relative w-fit h-fit text-white font-dogB text-xxs">
                Claim By:
              </div>
              <div className="relative w-fit h-fit text-white font-dog text-xxs">
                {postDescription.claimBy[2]}
              </div>
            </div>
            <div className="relative w-full h-14 flex items-start justify-center flex-col">
              <div className="relative w-fit h-fit text-white font-dogB text-xxs">
                Claim From:
              </div>
              <div className="relative w-fit h-fit text-white font-dog text-xxs">
                {postDescription.claimFrom[2]}
              </div>
            </div>
          </div>
          <div
            className={`relative border w-full h-fit border-white rounded-md cursor-pointer flex font-on items-center justify-center text-center text-lg uppercase ${
              currentMilestone <= 3 ? "bg-agua" : "bg-agua/30"
            }`}
            onClick={() => claimMilestone()}
          >
            <div
              className={`relative w-fit h-7 items-center justify-center flex text-center ${
                claimLoading[2] && "animate-spin"
              }`}
            >
              {claimLoading[2] ? (
                <AiOutlineLoading size={15} />
              ) : currentMilestone <= 3 ? (
                "claim"
              ) : (
                "claimed"
              )}
            </div>
          </div>
        </div>
        <div className="relative w-full h-full rounded-lg border border-plat flex flex-col items-start justify-center p-2">
          <div className="relative w-full h-fit flex flex-row items-center justify-center">
            <div className="relative w-full h-fit flex items-center justify-start font-on text-2xl uppercase">
              Milestone 2
            </div>
            <input
              className="text-white font-dogB flex items-center justify-center bg-black text-xs w-20 h-fit flex"
              defaultValue="$5000"
              disabled
            />
          </div>
          <div className="relative w-full h-fit flex flex-col font-dog text-xxs gap-1.5 text-white">
            <div className="flex relative w-fit h-fit justify-center items-start">
              <input
                value={postDescription.milestoneTwo[0]}
                onChange={(e) => {
                  const updatedMilestoneTwo = [...postDescription.milestoneTwo];
                  updatedMilestoneTwo[0] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: postDescription.milestoneOne,
                    milestoneTwo: updatedMilestoneTwo,
                    milestoneThree: postDescription.milestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
            <div className="flex relative w-fit h-fit justify-center items-start">
              <input
                value={postDescription.milestoneTwo[1]}
                onChange={(e) => {
                  const updatedMilestoneTwo = [...postDescription.milestoneTwo];
                  updatedMilestoneTwo[1] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: postDescription.milestoneOne,
                    milestoneTwo: updatedMilestoneTwo,
                    milestoneThree: postDescription.milestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
            <div className="flex relative w-fit h-fit justify-center items-start">
              <input
                value={postDescription.milestoneTwo[2]}
                onChange={(e) => {
                  const updatedMilestoneTwo = [...postDescription.milestoneTwo];
                  updatedMilestoneTwo[2] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: postDescription.milestoneOne,
                    milestoneTwo: updatedMilestoneTwo,
                    milestoneThree: postDescription.milestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
          </div>
          <div className="relative w-full h-fit flex flex-row items-center justify-center gap-3">
            <div className="relative w-full h-14 flex items-start justify-center flex-col">
              <div className="relative w-fit h-fit text-white font-dogB text-xxs">
                Claim By:
              </div>
              <div className="relative w-fit h-fit text-white font-dog text-xxs">
                {postDescription.claimBy[1]}
              </div>
            </div>
            <div className="relative w-full h-14 flex items-start justify-center flex-col">
              <div className="relative w-fit h-fit text-white font-dogB text-xxs">
                Claim From:
              </div>
              <div className="relative w-fit h-fit text-white font-dog text-xxs">
                {postDescription.claimFrom[1]}
              </div>
            </div>
          </div>
          <div
            className={`relative border w-full h-fit border-white rounded-md cursor-pointer font-on items-center justify-center text-center bg-agua flex text-lg uppercase ${
              currentMilestone <= 2 ? "bg-agua" : "bg-agua/30"
            } `}
            onClick={() => claimMilestone()}
          >
            <div
              className={`relative w-fit h-7 items-center justify-center flex text-center ${
                claimLoading[1] && "animate-spin"
              }`}
            >
              {claimLoading[1] ? (
                <AiOutlineLoading size={15} />
              ) : currentMilestone <= 2 ? (
                "claim"
              ) : (
                "claimed"
              )}
            </div>
          </div>
        </div>
        <div className="relative w-full h-full rounded-lg border border-plat flex flex-col items-start justify-center p-2">
          <div className="relative w-full h-fit flex flex-row items-center justify-center">
            <div className="relative w-full h-fit flex items-center justify-start font-on text-2xl uppercase">
              Milestone 1
            </div>
            <input
              className="text-white font-dogB flex items-center justify-center bg-black text-xs w-20 h-fit flex"
              defaultValue="$5000"
              disabled
            />
          </div>
          <div className="relative w-full h-fit flex flex-col font-dog text-xxs gap-1.5 text-white">
            <div className="flex relative w-fit h-fit justify-center items-start">
              <input
                value={postDescription.milestoneOne[0]}
                onChange={(e) => {
                  const updatedMilestoneOne = [...postDescription.milestoneOne];
                  updatedMilestoneOne[0] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: updatedMilestoneOne,
                    milestoneTwo: postDescription.milestoneTwo,
                    milestoneThree: postDescription.milestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
            <div className="flex relative w-fit h-fit justify-center items-start">
              {" "}
              <input
                value={postDescription.milestoneOne[1]}
                onChange={(e) => {
                  const updatedMilestoneOne = [...postDescription.milestoneOne];
                  updatedMilestoneOne[1] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: updatedMilestoneOne,
                    milestoneTwo: postDescription.milestoneTwo,
                    milestoneThree: postDescription.milestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
            <div className="flex relative w-fit h-fit justify-center items-start">
              {" "}
              <input
                value={postDescription.milestoneOne[2]}
                onChange={(e) => {
                  const updatedMilestoneOne = [...postDescription.milestoneOne];
                  updatedMilestoneOne[2] = e.target.value;
                  setPostDescription({
                    title: postDescription.title,
                    description: postDescription.description,
                    milestoneOne: updatedMilestoneOne,
                    milestoneTwo: postDescription.milestoneTwo,
                    milestoneThree: postDescription.milestoneThree,
                    claimBy: postDescription.claimBy,
                    claimFrom: postDescription.claimFrom,
                    teamInfo: postDescription.teamInfo,
                    challenge: postDescription.challenge,
                    value: postDescription.value,
                  });
                }}
                className="bg-black text-white font-dog text-xxs w-48 h-3"
              />
            </div>
          </div>
          <div className="relative w-full h-fit flex flex-row items-center justify-center gap-3">
            <div className="relative w-full h-14 flex items-start justify-center flex-col">
              <div className="relative w-fit h-fit text-white font-dogB text-xxs">
                Claim By:
              </div>
              <div className="relative w-fit h-fit text-white font-dog text-xxs">
                {postDescription.claimBy[0]}
              </div>
            </div>
            <div className="relative w-full h-14 flex items-start justify-center flex-col">
              <div className="relative w-fit h-fit text-white font-dogB text-xxs">
                Claim From:
              </div>
              <div className="relative w-fit h-fit text-white font-dog text-xxs">
                {postDescription.claimFrom[0]}
              </div>
            </div>
          </div>
          <div
            className={`relative border w-full h-fit border-white rounded-md cursor-pointer font-on items-center justify-center text-center bg-agua flex text-lg uppercase ${
              currentMilestone === 1 ? "bg-agua" : "bg-agua/30"
            } `}
            onClick={() => claimMilestone()}
          >
            <div
              className={`relative w-fit h-7 items-center justify-center flex text-center ${
                claimLoading[0] && "animate-spin"
              }`}
            >
              {claimLoading[0] ? (
                <AiOutlineLoading size={15} />
              ) : currentMilestone === 1 ? (
                "claim"
              ) : (
                "claimed"
              )}
            </div>
          </div>
        </div>
        <div
          className="relative w-full h-14 rounded-lg border border-plat flex flex-col items-center justify-center p-2 bg-oscuri cursor-pointer"
          onClick={
            !publication
              ? () => handlePost()
              : !collected
              ? () => handleCollect()
              : () => handleMirrorLike()
          }
        >
          <div
            className={`relative w-full h-full flex items-center justify-center font-air text-center text-2xl text-sol ${
              postLoading && "animate-spin"
            }`}
          >
            {postLoading ? (
              <AiOutlineLoading color={"white"} size={15} />
            ) : !publication ? (
              "Publish Grant"
            ) : !collected ? (
              "Collect Grant"
            ) : !reacted ? (
              "Interact Grant"
            ) : (
              "Claim Milestones"
            )}
          </div>
        </div>
      </div>
      <div className="relative w-36 gap-px h-full flex flex-col">
        {Array.from({ length: 20 }).map((_, index: number) => {
          const opacity = (index + 2) * 0.5;
          return (
            <div
              //   key={index}
              //   className={`relative w-full h-8 rounded-lg border-mosgu border-2 ${
              //     index < filledBars ? "barFilled" : ""
              //   }`}
              key={index}
              className={`relative w-full h-8 rounded-lg noFillbar ${
                collected ? "filledBar" : ""
              }`}
              style={{
                backgroundColor: `rgb(109, 212, 0, ${collected ? opacity : 0})`,
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default Milestone;
