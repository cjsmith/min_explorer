"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface ObservationListProps {
  observations: ObservationItem[];
  itemCount: number;
}

interface QuickObservation {
  avalancheConditions?: string[];
  rideType?: string[];
  snowConditions?: string[];
  weather?: string[];
  ridingQuality?: string;
  comment?: string;
}

interface DetailedObservation {
  submissionID: string;
  title: string;
  username: string;
  datetime: string;
  location: Location;
  region: string;
  imageCount: number;
  observationCounts: {
    quick?: number;
    weather?: number;
    snowpack?: number;
    avalanche?: number;
    incident?: number;
  };
  tags: string[];
  observations: {
    quick?: QuickObservation;
    weather?: any;
    snowpack?: any;
  };
  images?: Array<{
    id: string;
    url: string;
    width: number;
    height: number;
  }>;
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

export default function ObservationList({
  observations,
  itemCount,
}: ObservationListProps) {
  const [selectedObservation, setSelectedObservation] =
    useState<DetailedObservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchObservationDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://avcan-services-api.prod.avalanche.ca/min/en/submissions/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", JSON.stringify(data, null, 2));
        setSelectedObservation(data);
      }
    } catch (error) {
      console.error("Failed to fetch observation details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleObservationClick = async (id: string) => {
    // Update URL with observation ID
    router.push(`?observation=${id}`, { scroll: false });
    await fetchObservationDetails(id);
  };

  const closeDetailPanel = () => {
    setSelectedObservation(null);
    // Remove observation parameter from URL
    router.push("/", { scroll: false });
  };

  // Load observation from URL on mount
  useEffect(() => {
    const observationId = searchParams.get("observation");
    if (observationId) {
      fetchObservationDetails(observationId);
    }
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1>Avalanche Observations</h1>
        <p className={styles.subtitle}>
          Southwest Coast • {itemCount} observations
        </p>
      </header>

      <div className={styles.contentWrapper}>
        <div
          className={`${styles.listContainer} ${
            selectedObservation ? styles.listContainerSplit : ""
          }`}
        >
          {observations.map((obs) => (
            <div key={obs.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.title}>
                  <button
                    className={styles.titleButton}
                    onClick={() => handleObservationClick(obs.id)}
                  >
                    {obs.title}
                  </button>
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

        {selectedObservation && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <h2>{selectedObservation.title}</h2>
              <button
                className={styles.closeButton}
                onClick={closeDetailPanel}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.detailContent}>
                <div className={styles.detailSection}>
                  <h3>Information</h3>
                  <div className={styles.detailMeta}>
                    <div className={styles.detailMetaItem}>
                      <span className={styles.label}>Submitted by:</span>
                      <span className={styles.value}>
                        {selectedObservation.username}
                      </span>
                    </div>
                    <div className={styles.detailMetaItem}>
                      <span className={styles.label}>Date:</span>
                      <span className={styles.value}>
                        {formatDate(selectedObservation.datetime)}
                      </span>
                    </div>
                    <div className={styles.detailMetaItem}>
                      <span className={styles.label}>Region:</span>
                      <span className={styles.value}>
                        {selectedObservation.region}
                      </span>
                    </div>
                    <div className={styles.detailMetaItem}>
                      <span className={styles.label}>Location:</span>
                      <span className={styles.value}>
                        {selectedObservation.location.latitude.toFixed(4)},{" "}
                        {selectedObservation.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedObservation.observations.quick?.comment && (
                  <div className={styles.detailSection}>
                    <h3>Comments</h3>
                    <p className={styles.comment}>
                      {selectedObservation.observations.quick.comment}
                    </p>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <h3>Observation Counts</h3>
                  <div className={styles.observationGrid}>
                    {selectedObservation.observationCounts.quick !==
                      undefined && (
                      <div className={styles.observationItem}>
                        <span className={styles.obsLabel}>Quick</span>
                        <span className={styles.obsValue}>
                          {selectedObservation.observationCounts.quick}
                        </span>
                      </div>
                    )}
                    {selectedObservation.observationCounts.avalanche !==
                      undefined && (
                      <div className={styles.observationItem}>
                        <span className={styles.obsLabel}>Avalanche</span>
                        <span className={styles.obsValue}>
                          {selectedObservation.observationCounts.avalanche}
                        </span>
                      </div>
                    )}
                    {selectedObservation.observationCounts.snowpack !==
                      undefined && (
                      <div className={styles.observationItem}>
                        <span className={styles.obsLabel}>Snowpack</span>
                        <span className={styles.obsValue}>
                          {selectedObservation.observationCounts.snowpack}
                        </span>
                      </div>
                    )}
                    {selectedObservation.observationCounts.weather !==
                      undefined && (
                      <div className={styles.observationItem}>
                        <span className={styles.obsLabel}>Weather</span>
                        <span className={styles.obsValue}>
                          {selectedObservation.observationCounts.weather}
                        </span>
                      </div>
                    )}
                    {selectedObservation.observationCounts.incident !==
                      undefined && (
                      <div className={styles.observationItem}>
                        <span className={styles.obsLabel}>Incident</span>
                        <span className={styles.obsValue}>
                          {selectedObservation.observationCounts.incident}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedObservation.tags &&
                  selectedObservation.tags.length > 0 && (
                    <div className={styles.detailSection}>
                      <h3>Tags</h3>
                      <div className={styles.tags}>
                        {selectedObservation.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedObservation.images &&
                  selectedObservation.images.length > 0 && (
                    <div className={styles.detailSection}>
                      <h3>Images ({selectedObservation.images.length})</h3>
                      <div className={styles.imageGrid}>
                        {selectedObservation.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Observation image ${index + 1}`}
                            className={styles.detailImage}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
