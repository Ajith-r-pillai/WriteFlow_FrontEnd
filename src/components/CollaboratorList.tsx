// src/components/CollaboratorList.tsx
import type { User } from '../types';

interface Props {
  collaborators: User[];
  ownerId: string;
  currentUserId: string;
  onRemove: (userId: string) => void;
  onLeave: () => void;
}

export default function CollaboratorList({
  collaborators,
  ownerId,
  currentUserId,
  onRemove,
  onLeave,
}: Props) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Collaborators</h3>
      <ul className="list-disc ml-5">
        {collaborators.map((c) => (
          <li key={c._id} className="flex justify-between items-center">
            <span>
              {c.name} – {c.email}
            </span>
            {currentUserId === ownerId && c._id !== ownerId && (
              <button
                onClick={() => onRemove(c._id)}
                className="text-red-600 text-sm ml-2"
              >
                Remove
              </button>
            )}
            {currentUserId === c._id && currentUserId !== ownerId && (
              <button
                onClick={onLeave}
                className="text-orange-600 text-sm ml-2"
              >
                Leave
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
