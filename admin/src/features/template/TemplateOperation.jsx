import Filter from "../../ui/Filter";

export default function TemplateOperation() {
    return (
        <Filter
            filterField='isPublic'
            options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Public' },
                { value: 'false', label: 'Unpublic' },
            ]}
        />
    )
}
