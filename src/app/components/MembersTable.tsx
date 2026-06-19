import { Plus, Trash2 } from "lucide-react";

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

        <button
          type="button"
          onClick={addRow}
          className="px-3 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="size-4" />
          Add Member
        </button>
      </div>

      <table className="w-full border border-border rounded-lg overflow-hidden">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 border">Sr No</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Designation</th>
            <th className="p-3 border">Action</th>
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
                />
              </td>

              <td className="border p-2 text-center">
                {members.length > 1 && (
                  <button
                    onClick={() => removeRow(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="size-5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}