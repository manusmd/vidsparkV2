const getFunctionUrl = async (name: string, location = "us-central1") => {
  return `https://${location}-vidspark-77220.cloudfunctions.net/${name}`;
};
export default getFunctionUrl;
