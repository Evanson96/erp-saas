const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (rules.type === "string" && typeof value !== "string") {
        errors.push(`${field} must be a string`);
      }

      if (rules.type === "number" && Number.isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }

      if (rules.type === "array" && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters long`);
      }

      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
};

module.exports = validate;
