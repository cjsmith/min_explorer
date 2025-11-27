import styles from "./page.module.css";
import ObservationList from "./ObservationList";

interface Location {
  latitude: number;
  longitude: number;
}

interface Observations {
  avalanche: number;
  incident: number;
  quick: number;
  snowpack: number;
  weather: number;
}

interface ObservationItem {
  id: string;
  title: string;
  username: string;
  datetime: string;
  location: Location;
  region: string;
  imageCount: number;
  observations: Observations;
  tags: string[];
}

interface ApiResponse {
  items: {
    data: ObservationItem[];
  };
  itemCount: number;
}

async function fetchObservations(): Promise<ApiResponse> {
  // Calculate date range for the last week
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  // Format dates as YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const fromDate = formatDateForAPI(lastWeek);
  const toDate = formatDateForAPI(today);

  const url = `https://avcan-services-api.prod.avalanche.ca/min/en/submissions?fromdate=${fromDate}&todate=${toDate}&region=Southwest+Coast`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch observations");
  }

  return res.json();
}

export default async function Home() {
  const data = await fetchObservations();
  const observations = data.items.data;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ObservationList
          observations={observations}
          itemCount={data.itemCount}
        />
      </div>
    </main>
  );
}
