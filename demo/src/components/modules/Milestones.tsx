import { FunctionComponent } from "react";
import { MilestoneProps } from "../types/cypher.types";
import { AiOutlineLoading } from "react-icons/ai";

const Milestone: FunctionComponent<MilestoneProps> = ({
  setPostDescription,
  postDescription,
  claimMilestone,
  postLoading,
  handlePost,
  publication,
  handleCollect
}): JSX.Element => {
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
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
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
          <div className="relative border w-full h-fit border-white rounded-md cursor-pointer font-on items-center justify-center text-center bg-agua text-lg uppercase">
            claim
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
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
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
          <div className="relative border w-full h-fit border-white rounded-md cursor-pointer font-on items-center justify-center text-center bg-agua text-lg uppercase">
            claim
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
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
            <div className="flex relative w-fit h-fit justify-center items-start">{`* Key Milestone Accomplishment`}</div>
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
          <div className="relative border w-full h-fit border-white rounded-md cursor-pointer font-on items-center justify-center text-center bg-agua text-lg uppercase">
            claim
          </div>
        </div>
        <div
          className="relative w-full h-14 rounded-lg border border-plat flex flex-col items-center justify-center p-2 bg-oscuri cursor-pointer"
          onClick={!publication ? () => handlePost() : () => handleCollect()}
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
            ) : (
              "Collect Grant"
            )}
          </div>
        </div>
      </div>
      <div className="relative w-36 gap-px h-full flex flex-col">
        {Array.from({ length: 20 }).map((_, index: number) => {
          return (
            <div
              key={index}
              className="relative w-full h-8 rounded-lg border-mosgu border-2 "
              style={{
                backgroundColor: `rgb(109,212,0,${(index + 1) / 20})`,
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default Milestone;
