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

export default validatesignupdata;