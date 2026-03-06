import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Pencil, Trash, Copy } from "lucide-react"

const DropdownMenuDemo = () => {
    return (
        <div className="flex items-center justify-center p-12 min-h-[300px]">
            <DropdownMenu
                options={[
                    {
                        label: "Edit",
                        onClick: () => console.log("Edit"),
                        Icon: <Pencil className="h-4 w-4" />,
                    },
                    {
                        label: "Duplicate",
                        onClick: () => console.log("Duplicate"),
                        Icon: <Copy className="h-4 w-4" />,
                    },
                    {
                        label: "Delete",
                        onClick: () => console.log("Delete"),
                        Icon: <Trash className="h-4 w-4" />,
                    },
                ]}
            >
                Options
            </DropdownMenu>
        </div>
    );
};

export { DropdownMenuDemo }
