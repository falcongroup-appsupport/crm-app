import { useCallback, useEffect, useState } from "react";
import { activityApi } from "../api/activity.api";

export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [connected, setConnected] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await activityApi.getAll();
      setActivities(Array.isArray(data) ? data : []);
      setConnected(true);
    } catch {
      setActivities([]);
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addActivity = useCallback(
    async (activityName) => {
      const created = await activityApi.create({ activityName, active: true });
      await load();
      return created;
    },
    [load],
  );

  return { activities, connected, refresh: load, addActivity };
}
