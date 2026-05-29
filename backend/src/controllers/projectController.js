import { z } from "zod";
import { Project } from "../models/Project.js";

const createSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["image", "pdf", "convert"]),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const listProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ ownerId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const project = await Project.create({
      ownerId: req.user.id,
      name: payload.name,
      type: payload.type,
      thumbnailUrl: payload.thumbnailUrl,
      metadata: payload.metadata ?? {},
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const updates = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      updates,
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
