import { useRef, useEffect, useCallback } from "react";

export const useInfiniteScroll = ({
  loading,
  hasMore,
  onLoadMore,
  threshold = 1.0,
  rootMargin = "100px",
}) => {
  const sentinelRef = useRef(null);

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        onLoadMore();
      }
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin]);

  return sentinelRef;
};
