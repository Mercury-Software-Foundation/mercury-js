import mercury from "@mercury-js/core";

const rules = [
    {
        modelName: "User",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    }
];
export const AdminProfile = mercury.access.createProfile("Admin", rules);