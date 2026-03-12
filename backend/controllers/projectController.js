import Project from "../models/Project.js";

export const createProject = async (req, res) => {
  try {

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description || "",
      userId: req.user.id
    });

    res.status(201).json(project);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {

    const projects = await Project.find({ userId: req.user.id });

    res.json(projects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
