import validator from "validator";

const validateSignedUpData = (req) => {
    const {name, emailId, password, age, avatar} = req.body;
    
    if(!name || !emailId || !password){
        throw new Error("Name, emailId and password are required!");
    }

    if(!validator.isEmail(emailId)){
        throw new Error("Email Id is not valid!");
    }
    
    if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong password!");
    }
}

export default validateSignedUpData;