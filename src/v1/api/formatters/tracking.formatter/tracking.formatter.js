export function locationFormatter(req) {
  const {
    employeeId,
    latitude,
    longitude,
    // include other fields if needed
  } = req.body;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  return {
    employeeId,
    location: (lat && lng) ? {
      type: "Point",
      coordinates: [lng, lat], // GeoJSON format is [lng, lat]
    } : null,
  };
}
