export const extractCreateParams = (body) => {
    const { Name, status = "active", Cost } = body;

    if (!Name || !Cost) {
        throw new Error("Name and Cost are required");
    }

    return { Name, status, Cost };
};

export const extractUpdateParams = (body) => {
    const updates = {};
    if (body.Name) updates.Name = body.Name;
    if (body.status) updates.status = body.status;
    if (body.Cost) updates.Cost = body.Cost;

    return updates;
};
