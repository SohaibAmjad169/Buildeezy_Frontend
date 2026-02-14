import { getFileName } from "../utils/file";

function useDownloadFile() {
  const downloadFile = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl, {
        method: "GET",
      });
      const blob = await response.blob();
      const link = document.createElement("a");

      // Create a URL for the blob and set it as the href attribute
      link.href = window.URL.createObjectURL(blob);

      // Set the download attribute with the filename
      link.download = getFileName(fileUrl);

      // Append the link to the body
      document.body.appendChild(link);

      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };
  return { downloadFile };
}

export default useDownloadFile;
