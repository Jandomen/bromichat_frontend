export default function GroupNotifications({ notifications }) {
  return (
    <div className="mt-2">
      {notifications.map((n, index) => (
        <div key={index} className="text-xs text-gray-500">
          {n.message}
        </div>
      ))}
    </div>
  );
}
