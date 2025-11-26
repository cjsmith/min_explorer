import styles from "./page.module.css";

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function Home() {
  const data = await fetchObservations();
  const observations = data.items.data;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Avalanche Observations</h1>
          <p className={styles.subtitle}>
            Southwest Coast • {data.itemCount} observations
          </p>
        </header>

        <div className={styles.listContainer}>
          {observations.map((obs) => (
            <div key={obs.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.title}>
                  <a
                    href={`https://avalanche.ca/map?panel=mountain-information-network-submissions/${obs.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {obs.title}
                  </a>
                </h2>
                <span className={styles.imageCount}>📷 {obs.imageCount}</span>
              </div>

              <div className={styles.metadata}>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Submitted by:</span>
                  <span className={styles.value}>{obs.username}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Date:</span>
                  <span className={styles.value}>
                    {formatDate(obs.datetime)}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Location:</span>
                  <span className={styles.value}>
                    {obs.location.latitude.toFixed(4)},{" "}
                    {obs.location.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              <div className={styles.observations}>
                <h3>Observations</h3>
                <div className={styles.observationGrid}>
                  <div className={styles.observationItem}>
                    <span className={styles.obsLabel}>Quick</span>
                    <span className={styles.obsValue}>
                      {obs.observations.quick}
                    </span>
                  </div>
                  <div className={styles.observationItem}>
                    <span className={styles.obsLabel}>Avalanche</span>
                    <span className={styles.obsValue}>
                      {obs.observations.avalanche}
                    </span>
                  </div>
                  <div className={styles.observationItem}>
                    <span className={styles.obsLabel}>Snowpack</span>
                    <span className={styles.obsValue}>
                      {obs.observations.snowpack}
                    </span>
                  </div>
                  <div className={styles.observationItem}>
                    <span className={styles.obsLabel}>Weather</span>
                    <span className={styles.obsValue}>
                      {obs.observations.weather}
                    </span>
                  </div>
                  <div className={styles.observationItem}>
                    <span className={styles.obsLabel}>Incident</span>
                    <span className={styles.obsValue}>
                      {obs.observations.incident}
                    </span>
                  </div>
                </div>
              </div>

              {obs.tags && obs.tags.length > 0 && (
                <div className={styles.tags}>
                  {obs.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
