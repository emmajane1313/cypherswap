import { FormEvent, FunctionComponent } from "react";
import { GrantProps } from "../types/cypher.types";
import { INFURA_GATEWAY } from "../../../lib/constants";
import Image from "next/image";
import { AiTwotoneHeart, AiOutlineRetweet } from "react-icons/ai";

const Grant: FunctionComponent<GrantProps> = ({
  postDescription,
  setPostDescription,
  setCoverImageValue,
  publication,
  reacted,
  collected,
}): JSX.Element => {
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center rounded-lg border border-agua p-4 gap-6 ${
        publication
          ? "bg-agua/30"
          : reacted
          ? "bg-agua/50"
          : collected
          ? "bg-agua/70"
          : "bg-none"
      }`}
    >
      {reacted && (
        <div className="absolute flex -top-8 -right-2 w-fit h-fit ml-auto flex-row gap-2 z-10">
          <div className="relative w-full h-full p-1.5 bg-black rounded-full border border-agua">
            <AiTwotoneHeart size={25} color="#FA6400" />
          </div>
          <div className="relative w-full h-full p-1.5 bg-black rounded-full border border-agua">
            <AiOutlineRetweet size={25} color="#FA6400" />
          </div>
        </div>
      )}
      <div className="relative w-full h-12 flex flex-col border border-white rounded-lg">
        <input
          className="relative w-full h-full flex items-center justify-center text-sm font-dogB text-white rounded-lg bg-black p-1"
          placeholder="Grant Title"
          onChange={(e) =>
            setPostDescription({
              title: e.target.value,
              description: postDescription.description,
              milestoneOne: postDescription.milestoneOne,
              milestoneTwo: postDescription.milestoneTwo,
              milestoneThree: postDescription.milestoneThree,
              claimBy: postDescription.claimBy,
              claimFrom: postDescription.claimFrom,
              teamInfo: postDescription.teamInfo,
              challenge: postDescription.challenge,
              value: postDescription.value,
            })
          }
          value={postDescription.title}
          style={{ resize: "none" }}
          disabled={publication ? true : false}
        />
      </div>
      <div className="relative w-full h-full flex flex-col border border-white rounded-lg">
        <textarea
          className="relative w-full h-28 flex items-center justify-center text-xs font-dog text-white rounded-lg bg-black  p-2"
          placeholder="Grant Description..."
          value={postDescription.description}
          onChange={(e) =>
            setPostDescription({
              title: postDescription.title,
              description: e.target.value,
              milestoneOne: postDescription.milestoneOne,
              milestoneTwo: postDescription.milestoneTwo,
              milestoneThree: postDescription.milestoneThree,
              claimBy: postDescription.claimBy,
              claimFrom: postDescription.claimFrom,
              teamInfo: postDescription.teamInfo,
              challenge: postDescription.challenge,
              value: postDescription.value,
            })
          }
          style={{ resize: "none" }}
          disabled={publication ? true : false}
        ></textarea>
      </div>
      <div className="relative w-full h-[15.5rem] flex flex-row items-center justify-center p-2 gap-4">
        <div className="relative w-full h-full flex flex-col border border-white rounded-lg p-1.5 gap-2">
          <div className="relative w-full h-fit font-dogB font-sm flex text-white">
            Challenge
          </div>
          <textarea
            className="relative w-full h-full flex items-center justify-center text-xs font-dog text-white rounded-lg bg-black p-2"
            placeholder="What problem does this grant solve?"
            value={postDescription.challenge}
            onChange={(e) =>
              setPostDescription({
                title: postDescription.title,
                description: postDescription.description,
                milestoneOne: postDescription.milestoneOne,
                milestoneTwo: postDescription.milestoneTwo,
                milestoneThree: postDescription.milestoneThree,
                claimBy: postDescription.claimBy,
                claimFrom: postDescription.claimFrom,
                teamInfo: postDescription.teamInfo,
                challenge: e.target.value,
                value: postDescription.value,
              })
            }
            style={{ resize: "none" }}
            disabled={publication ? true : false}
          ></textarea>
        </div>
        <div className="relative w-full h-full flex items-center justify-center border border-white rounded-lg">
          <label
            className={`relative w-full h-full rounded-lg items-center flex cursor-pointer`}
            onChange={(e: FormEvent) => setCoverImageValue(e)}
          >
            <Image
              src={`${INFURA_GATEWAY}/ipfs/Qma1qoGiZwXoujQE8ZZJWP2FpkyuYdGDN2DfGsvXNAsWDL`}
              alt="opt"
              className="rounded-lg w-full h-full object-cover"
              fill
              draggable={false}
            />
            <input
              type="file"
              accept="image/png"
              hidden
              required
              id="files"
              multiple={true}
              name="images"
              className="caret-transparent"
              disabled={false}
            />
          </label>
        </div>
      </div>
      <div className="relative w-full h-full flex flex-col border border-white rounded-lg p-1.5 gap-1.5">
        <div className="relative w-full h-fit font-dogB text-sm flex text-white">
          Team Info
        </div>
        <textarea
          className="relative w-full h-full flex items-center justify-center text-xs font-dog text-white rounded-lg bg-black p-2"
          placeholder="Who is behind the grant, why are they working on it, what are their expectatons beyond the grant"
          onChange={(e) =>
            setPostDescription({
              title: postDescription.title,
              description: postDescription.description,
              milestoneOne: postDescription.milestoneOne,
              milestoneTwo: postDescription.milestoneTwo,
              milestoneThree: postDescription.milestoneThree,
              claimBy: postDescription.claimBy,
              claimFrom: postDescription.claimFrom,
              teamInfo: e.target.value,
              challenge: postDescription.challenge,
              value: postDescription.value,
            })
          }
          value={postDescription.teamInfo}
          style={{ resize: "none" }}
          disabled={publication ? true : false}
        ></textarea>
      </div>
    </div>
  );
};
export default Grant;
