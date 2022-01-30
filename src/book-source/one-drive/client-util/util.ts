export const blobToBase64 = async (b: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") resolve("");
      else resolve(reader.result);
    };
    reader.readAsDataURL(b);
  });
};
