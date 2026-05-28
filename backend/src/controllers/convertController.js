import archiver from "archiver";
import { convertBuffer } from "../services/office-convert.js";

const docxMime =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const pptxMime =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const xlsxMime =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const allowedOfficeMimes = [docxMime, pptxMime, xlsxMime];

export const convertDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!allowedOfficeMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Unsupported document type" });
    }

    const pdfBuffer = await convertBuffer(req.file.buffer, "pdf");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.file.originalname.replace(/\.[^.]+$/, "")}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const convertPdfToOffice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF is supported" });
    }

    const target = req.params.target;
    if (!target || !["docx", "pptx", "xlsx"].includes(target)) {
      return res.status(400).json({ message: "Unsupported target format" });
    }

    const outputBuffer = await convertBuffer(req.file.buffer, target);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.file.originalname.replace(/\.[^.]+$/, "")}.${target}"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument"
    );
    res.send(outputBuffer);
  } catch (error) {
    next(error);
  }
};

export const convertBatch = async (req, res, next) => {
  try {
    const target = req.body?.target;
    if (!target || !["pdf", "docx", "pptx", "xlsx"].includes(target)) {
      return res.status(400).json({ message: "Unsupported batch target" });
    }

    const files = req.files;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "Files are required" });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=converted.zip");
    archive.pipe(res);

    for (const file of files) {
      const isOffice = allowedOfficeMimes.includes(file.mimetype);
      const isPdf = file.mimetype === "application/pdf";
      if (target === "pdf" && !isOffice) continue;
      if (target !== "pdf" && !isPdf) continue;

      const outputBuffer = await convertBuffer(file.buffer, target);
      const outputName = `${file.originalname.replace(/\.[^.]+$/, "")}.${target}`;
      archive.append(outputBuffer, { name: outputName });
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};
