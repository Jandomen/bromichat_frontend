export default function GroupParticipants({ participants }) {
  return (
    <div className="mb-2 border-b pb-1">
      <h2 className="text-sm font-semibold">Participantes:</h2>
      <ul className="flex gap-2 flex-wrap">
        {participants.map((p) => (
          <li key={p._id} className="text-xs bg-gray-200 px-2 rounded">
            {p.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
