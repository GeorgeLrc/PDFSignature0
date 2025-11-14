import { IconDashboard, IconFileText, IconClock, IconList, IconClipboardList } from "@tabler/icons-react";

export const navbarLinks = [
    {
        links: [
            {
                label: 'Dashboard',
                icon: IconDashboard,
                path: '/dashboard'
            },
            {
                label: "Requests",
                icon: IconList,
                path: "/requests",
            },
            {
                label: "Templates",
                icon: IconFileText,
                path: "/templates",
            },
            {
                label: "Reports",
                icon: IconClipboardList,
                path: "/reports",
            },
            {
                label: "History",
                icon: IconClock,
                path: "/history",
            },
        ],
    }
];