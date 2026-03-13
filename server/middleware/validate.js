const validate = (schema) => (req, res, next) => {

  try {

    schema.parse(req.body);

    next();

  } catch (error) {
    const issues = Array.isArray(error?.issues)
      ? error.issues.map((i) => ({ path: i.path?.join(".") || "", message: i.message }))
      : null;

    res.status(400).json({
      message: issues?.[0]?.message || "Validation error",
      issues: issues || undefined,
    });

  }

};

export default validate;
