import validator from "validator";

const validatesignupdata = (req) => {
    const { first_name , last_name , email , password_hash , role} = req;

    if(!first_name || !last_name) {
        throw new Error("Invalid name");
    }
    else if(!validator.isEmail(email)) {
        throw new Error("Invalid email address");
    }
    else if(!validator.isStrongPassword(password_hash)) {
        throw new Error("use strong password");
    }
    else if(!role) {
        throw new Error("Invalid role");
    }
}
export const validateApproveLeave = (req) => {
  const { id } = req.params;
  const { reviewer_comment } = req.body || {};

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw new Error("Invalid leave request ID");
  }

  if (
    reviewer_comment !== undefined &&
    reviewer_comment !== null &&
    typeof reviewer_comment !== "string"
  ) {
    throw new Error("Reviewer comment must be a string");
  }

  if (typeof reviewer_comment === "string") {
    req.body.reviewer_comment = reviewer_comment.trim();
  }
};

export const validateRejectLeave = (req) => {
  const { id } = req.params;

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw new Error("Invalid leave request ID");
  }
};


export const validateCreateLeaveBalance = (data) => {
  const {
    employee_id,
    leave_type_id,
    leave_year,
    allocated_days,
  } = data;

  if (
    !employee_id ||
    !leave_type_id ||
    !leave_year ||
    !allocated_days
  ) {
    throw new Error("All fields are required");
  }

  if (
    !Number.isInteger(Number(employee_id)) ||
    Number(employee_id) <= 0
  ) {
    throw new Error("Invalid employee_id");
  }

  if (
    !Number.isInteger(Number(leave_type_id)) ||
    Number(leave_type_id) <= 0
  ) {
    throw new Error("Invalid leave_type_id");
  }
};


export default {validatesignupdata , validateApproveLeave , validateRejectLeave , validateCreateLeaveBalance};