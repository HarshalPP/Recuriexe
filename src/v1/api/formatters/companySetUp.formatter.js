
export function formatcompanySetUp(req) {
    const {
        companyId,
        logo,
        title,
    } = req.body;

    return {
        companyId,
        logo,
        title,
    };
}
