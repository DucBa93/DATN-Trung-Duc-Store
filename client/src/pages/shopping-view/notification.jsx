import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../../store/notification-slice";

function NotificationList() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list } = useSelector((state) => state.notification);

  useEffect(() => {
    if (user?.id) dispatch(fetchNotifications(user.id));
  }, [user]);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="font-bold mb-2">🔔 Notifications</h3>
      {list.map((n) => (
        <div key={n._id} className={`p-2 border-b ${n.isRead ? "text-gray-500" : "text-black"}`}>
          {n.message}
        </div>
      ))}
    </div>
  );
}

export default NotificationList;
