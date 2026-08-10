import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { boardingPointsApi } from "@/features/boardingPoints/api/boardingPointsApi";

export function usePaginatedBoardingPoints({
  address,
  page,
  limit = 10,
}: {
  address?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["boardingPoints", "paginated", { address, page, limit }],
    queryFn: () =>
      boardingPointsApi.getBoardingPointsPaginated({ address, page, limit }),
    placeholderData: keepPreviousData,
  });
}
