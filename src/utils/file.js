import pngIcon from "../assets/images/png_icon.svg";
import svgIcon from "../assets/images/svg_icon.svg";
import jpgIcon from "../assets/images/jpg_icon.svg";
import docIcon from "../assets/images/doc_icon.svg";
import xlsIcon from "../assets/images/xls_icon.svg";
import pptIcon from "../assets/images/ppt_icon.svg";
import pdfIcon from "../assets/images/pdf_icon.svg";
import csvIcon from "../assets/images/csv_icon.svg";
import txtIcon from "../assets/images/txt_icon.svg";
import docxIcon from "../assets/images/docx_icon.svg";
import xlsxIcon from "../assets/images/xlsx_icon.svg";
import pptxIcon from "../assets/images/pptx_icon.svg";
import videoIcon from "../assets/images/video_icon.svg";

export const DOC_TYPES = {
  png: pngIcon,
  webp: pngIcon,
  jpg: jpgIcon,
  jpeg: jpgIcon,
  jfif: jpgIcon,
  gif: jpgIcon,
  svg: svgIcon,

  pdf: pdfIcon,
  doc: docIcon,
  docx: docxIcon,
  xls: xlsIcon,
  xlsx: xlsxIcon,
  ppt: pptIcon,
  pptx: pptxIcon,
  csv: csvIcon,
  txt: txtIcon,

  mp4: videoIcon,
  mov: videoIcon,
  webm: videoIcon,
};

export const FILE_TYPES = {
  pdf: "file",
  doc: "file",
  docx: "file",
  xls: "file",
  xlsx: "file",
  ppt: "file",
  pptx: "file",
  csv: "file",
  txt: "file",

  webp: "image",
  jfif: "image",
  svg: "image",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",

  mp4: "video",
  mov: "video",
  webm: "video",
};

export const FULL_DOC_TYPES = {
  jfif: "image/jfif",
  jpeg: "image/jpeg",
  jpg: "image/jpg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg",

  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",

  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  txt: "text/plain",
};

export const ALL_FILE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
  "image/webp": [],
  "image/gif": [],
  "image/svg": [],
  "image/jfif": [],

  "video/mp4": [],
  "video/quicktime": [],
  "video/webm": [],

  "application/pdf": [],
  "application/msword": [],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
  "application/vnd.ms-excel": [],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
  "application/vnd.ms-powerpoint": [],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    [],
  "text/csv": [],
  "text/plain": [],
};

export const IMAGE_FILE_TYPES = {
  "image/jfif": [],
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
  "image/webp": [],
  "image/svg": [],
};

export const VIDEO_FILE_TYPES = {
  "video/mp4": [],
  "video/quicktime": [],
  "video/webm": [],
};

export const OFFICE_FILE_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  txt: "text/plain",
};

export const EXCEL_FILE_TYPES = {
  "application/vnd.ms-excel": [],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
};

export const getFileName = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return '';
  const fileNameArray = fileUrl.toLowerCase().split("/");
  return fileNameArray[fileNameArray.length - 1];
};

export const getFileFormat = (fileUrl) => {
  if (typeof fileUrl !== "string") return "";
  const fileNameArray = fileUrl.toLowerCase().split(".");
  return fileNameArray[fileNameArray.length - 1] || "";
};

export const getDocIcon = (file) => {
  if (!file || typeof file !== 'string') {
    return 'default';
  }
  const docType = getFileFormat(file?.toLowerCase());
  return docType || 'default';
};

export const getFileType = (url) => FILE_TYPES[getFileFormat(url)];