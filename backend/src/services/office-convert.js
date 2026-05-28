import libre from "libreoffice-convert";
import { promisify } from "util";

const convertAsync = promisify(libre.convert);

export const convertBuffer = async (buffer, targetExt) => {
  const outputBuffer = await convertAsync(buffer, `.${targetExt}`, undefined);
  return outputBuffer;
};
