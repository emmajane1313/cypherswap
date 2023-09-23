import lodash from "lodash";
import { v4 as uuidv4 } from "uuid";

const uploadPostContent = async (
  postImages: any[] | undefined,
  postDescription: string,
  setContentURI: (e: string | undefined) => void,
  contentURI: string | undefined
): Promise<string | undefined> => {
  let newImages: any[] = [];
  postImages?.forEach((image) => {
    newImages.push({
      item: image.type !== 2 ? "ipfs://" + image.cid : image.cid,
      type:
        image.type === 1
          ? "image/png"
          : image.type === 2
          ? "image/gif"
          : "video/mp4",
      altTag: image.cid,
    });
  });

  const coverImage = lodash.filter(newImages, (image: any) => {
    if (image.type === "image/png" || image.type === "image/gif") return true;
  });
  const videos = lodash.filter(newImages, (image: any) => {
    if (image.type === "video/mp4") return true;
  });

  const data = {
    version: "2.0.0",
    metadata_id: uuidv4(),
    description: postDescription,
    content: postDescription,
    external_url: "https://www.cypherswap.xyz/",
    image: coverImage.length > 0 ? (coverImage[0] as any).item : null,
    imageMimeType: "image/png",
    name: postDescription ? postDescription?.slice(0, 20) : "CypherSwap",
    mainContentFocus:
      videos?.length > 0
        ? "VIDEO"
        : newImages.length > 0
        ? "IMAGE"
        : postDescription?.length > 270
        ? "ARTICLE"
        : "TEXT_ONLY",
    contentWarning: null,
    attributes: [],
    media: newImages,
    locale: "en",
    tags: ["cyphergrant"],
    appId: "cypherswap",
  };

  try {
    const response = await fetch("/api/ipfs", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.status !== 200) {
    } else {
      let responseJSON = await response.json();
      setContentURI(responseJSON.cid);
      return responseJSON.cid;
    }
  } catch (err: any) {
    console.error(err.message);
  }
  return contentURI;
};

export default uploadPostContent;
