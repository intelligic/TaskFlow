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

    const query = req.user && req.user.role === "admin" ? {} : { userId: req.user.id };
    const projects = await Project.find(query).sort({ createdAt: -1 });

    res.json(projects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const query = req.user && req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

    const project = await Project.findOne(query);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
