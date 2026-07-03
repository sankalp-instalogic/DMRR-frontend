import { Plus, Trash2 } from "lucide-react";

import { Button } from "./ui/button";
import type { Member } from "../../../constants/stageTypes";

interface MembersTableProps {
  members: Member[];
  setMembers: (members: Member[]) => void;
}

export function MembersTable({ members, setMembers }: MembersTableProps) {
  const addRow = () => {
    setMembers([
      ...members,
      {
        srNo: members.length + 1,
        name: "",
        designation: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    setMembers(
      members
        .filter((_, i) => i !== index)
        .map((m, idx) => ({
          ...m,
          srNo: idx + 1,
        })),
    );
  };

  const updateField = (
    index: number,
    field: "name" | "designation",
    value: string,
  ) => {
    setMembers(
      members.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Members Present</h4>

        <Button type="button" onClick={addRow}>
          <Plus className="size-4" aria-hidden="true" />
          Add Member
        </Button>
      </div>

      <table className="w-full border border-border rounded-lg overflow-hidden">
        <caption className="sr-only">Members present</caption>
        <thead className="bg-muted">
          <tr>
            <th scope="col" className="p-3 border">Sr No</th>
            <th scope="col" className="p-3 border">Name</th>
            <th scope="col" className="p-3 border">Designation</th>
            <th scope="col" className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member, index) => (
            <tr key={index}>
              <td className="border p-2 text-center">{member.srNo}</td>

              <td className="border p-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateField(index, "name", e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  aria-label={`Name for member ${member.srNo}`}
                />
              </td>

              <td className="border p-2">
                <input
                  type="text"
                  value={member.designation}
                  onChange={(e) =>
                    updateField(index, "designation", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded"
                  aria-label={`Designation for member ${member.srNo}`}
                />
              </td>

              <td className="border p-2 text-center">
                {members.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(index)}
                    className="text-destructive"
                    aria-label={`Delete member ${member.srNo}`}
                  >
                    <Trash2 className="size-5" aria-hidden="true" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}