export const notFoundMiddleware = (req, res, next) => {
    const isSwaggerRoute = req.path.startsWith("/docs");
  
    if (!isSwaggerRoute) {
      res.status(404).json({ success: false, message: "Route not found" });
    }
    
    next(); 
  };
  