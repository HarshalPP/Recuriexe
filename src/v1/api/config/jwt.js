import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign(id , process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const googleToken = (id , role)=>{
  return jwt.sign({id,role} , process.env.JWT_SECRET)
}

export const verifyToken = (token) => {
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
  } catch (error) {
      console.log(error);
      return null;
  }
}

