import Filter from "../../ui/Filter";
import SortBy from "../../ui/SortBy";

export default function UserTableOperation() {
    return (
        <div className="flex flex-col gap-2 md:items-center w-fit md:flex-row">
            <Filter
                filterField='status'
                options={[
                    { value: 'all', label: 'All' },
                    { value: 'true', label: 'Restricted' },
                    { value: 'false', label: 'Unrestricted' },
                ]}
            />
            <SortBy options={[
                { value: 'first_name-asc', label: 'Sort by name (A-Z)' },
                { value: 'first_name-desc', label: 'Sort by name (Z-A)' },
                { value: "date-desc", label: "Sort by date (recent first)" },
                { value: "date-asc", label: "Sort by date (earlier first)" },
            ]} />
        </div>
    )
}
